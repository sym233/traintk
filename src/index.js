import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


// const transferor_url = 'http:\/\/127.0.0.1/transferor/transferor.php';
const transferor_url = 'http:\/\/115.159.213.127/transferor/transferor.php';

const station_names_ver = '1.8902';

const station_names_url = `https:\/\/kyfw.12306.cn/otn/resources/js/framework/station_name.js?\
station_version=${station_names_ver}`;

const ticket_left_url = (date, from_station_code, to_station_code, adult_or_stu)=>
// date: YYYY-MM-DD
// adult_or_stu: 'ADULT' or '0X00'(?)
`https:\/\/kyfw.12306.cn/otn/leftTicket/query?\
leftTicketDTO.train_date=${date}&\
leftTicketDTO.from_station=${from_station_code}&\
leftTicketDTO.to_station=${to_station_code}&\
purpose_codes=${adult_or_stu}`;

const ticket_price_url = (train_no, from_order, to_order, seat_types, date)=>
`https:\/\/kyfw.12306.cn/otn/leftTicket/queryTicketPrice?\
train_no=${train_no}&\
from_station_no=${from_order}&\
to_station_no=${to_order}&\
seat_types=${seat_types}&\
train_date=${date}`;

let station_names;

function poster(url, headers, body){
	return new Promise((resolve, reject)=>{
		const req = new XMLHttpRequest();
		req.open('POST', url, true);
		
		if(headers){
			if(headers instanceof Headers){
				for(let h of headers.entries()){
					req.setRequestHeader(h[0], h[1]);
				}
			}else{
				for(let h in headers){
					req.setRequestHeader(h, headers[h]);
				}
			}
		}
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		req.onreadystatechange = function(){
			if(req.readyState === XMLHttpRequest.DONE){
				if(req.status === 200){
					resolve(req.response);
				}else{
					reject(req.response);
				}
			}
		}

		if(body){
			req.send(body);
		}else{
			req.send();
		}
	});
}

function get_train_price(train_no, from_order, to_order, seat_types, date){
	const new_date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
	console.log(Array.from(arguments));
	const url = ticket_price_url(train_no, from_order, to_order, seat_types, new_date);
	const target = document.getElementById(train_no);

	const seats = {
		'WZ': 'wuzuo',
		'A1': 'yingzuo',
		'A2': 'ruanzuo',
		'A3': 'yingwo',
		'A4': 'ruanwo',
		'A6': 'gaoruan',
		'O': 'erdengzuo',
		'P': 'yidengzuo',
		'A9': 'shangwuzuo',
	}
	
	function fill_price(seat, price){
		if(target){
			const td = target.getElementsByClassName(seat)[0];
			const blank = td.getElementsByClassName('price')[0];
			blank.innerHTML = price;
		}else{
			throw 'no target';
		}
	}
	
	poster(transferor_url, {}, `url=${encodeURIComponent(url)}`).then(val=>{
		if(!val || val === -1){
			throw '返回错误';
		}
		const parsed = JSON.parse(val);
		if(!parsed.status){
			throw '数据错误';
		}

		return parsed.data;
	}).then(data=>{
		console.log(data);
		for(let i in data){
			if(i in seats){
				fill_price(seats[i], data[i]);
			}
		}
	});

}

function parse_train_result(str){
	// example
	// decoded
	// 2WkQS0wD3fbyjQBfmBwrTzEgINTdswO9D52rdXWHwQFvSKMONs31N7+ELZ9JU8OGMdJYJg4KShdVFoTHBVm+isjaEUSxRB/1MPKiiQA2/0LIFXMC6K6+LPus7HAJ+8llr1oeTIcJILpOETKRZofAKI22hhzP5wjRhJYAgEppKPlHU+1B1apTFi+Ch7cax8/nVk+GaeHvMuAMyo8XrbrBoTUFEPysH27b9hxb7MFmiVkF3aEL|预订|240000G1010C|G101|VNP|AOH|VNP|AOH|06:44|12:38|05:54|Y|7ghoA/PKKLO0Jj1JoG4owYAyEgbWaF9SKqqpi8fAOxJdeN+z|20170518|3|P2|01|11|1|0|||||||||||有|有|有|O0M090|OM9
	// or
	// |23:00-06:00系统维护时间|240000G1010C|G101|VNP|AOH|VNP|AOH|06:44|12:38|05:54|IS_TIME_NOT_BUY|fPyHx8KCpWqt7wgbm0dDZZPBWuiitFjZhV2W7XWnHLscYzmY|20170518|3|P2|01|11|1|0|||||||||||有|有|有|O0M090|OM9
	// 用 '|' 隔开了35项
	
	// split
	// (0) ["2WkQS0wD3fbyjQBfmBwrTzEgINTdswO9D52rdXWHwQFvSKMONs…nVk+GaeHvMuAMyo8XrbrBoTUFEPysH27b9hxb7MFmiVkF3aEL", 
	// (1-7) "预订", "240000G1010C", "G101", "VNP", "AOH", "VNP", "AOH",
	// (8-12) "06:44", "12:38", "05:54", "Y", "7ghoA/PKKLO0Jj1JoG4owYAyEgbWaF9SKqqpi8fAOxJdeN+z",
	// (13-19) "20170518", "3", "P2", "01", "11", "1", "0",
	// (20-34) "", "", "", "", "", "", "", "", "", "", "有", "有", "有", "O0M090", "OM9"]

	// 参考了 https://github.com/jokermonn/-Api/blob/master/12306.md
	// 但是似乎接口又变了

	const splited = decodeURIComponent(str).split('|');
	const result = {
		// 是否可预定： 预订 | 23:00-06:00系统维护时间
		// 或者是备注？
		'bookable': splited[1],
		// 订票用车次
		'train_no': splited[2],
		// 车次
		'train_code': splited[3],
		// 始发站，code
		'originating_station': splited[4],
		// 终点站，code
		'terminal': splited[5],
		// 出发站，code
		'from': splited[6],
		// 到达站，code
		'to': splited[7],
		// 出发时间，'hh:mm'
		'from_time': splited[8],
		// 到达时间，'hh:mm'
		'to_time': splited[9],
		// 历时，'hh:mm'
		'lasted': splited[10],
		// 是否可以购买： Y | N | IS_TIME_NOT_BUY
		'buyable': splited[11],

		// 列车出发日期， YYYYMMDD
		'train_start_day': splited[13],

		// 出发和到达站序
		// 线路中该站的序号
		'from_order': splited[16],
		'to_order': splited[17],

		// 高软
		'gaoruan': splited[21],
		// 软卧
		'ruanwo': splited[23],
		// 特等座
		'tedeng': splited[25],
		// 无座
		'wuzuo': splited[26],
		// 硬卧
		'yingwo': splited[28],
		// 硬座
		'yingzuo': splited[29],
		// 二等座
		'erdengzuo': splited[30],
		// 一等座
		'yidengzuo': splited[31],
		// 商务座
		'shangwuzuo': splited[32],

		// 也许是该车含有的座位类型
		'seat_types': splited[34],
	};
	return result;

}

function parse_train_search(str){
	if(!str){
		return {
			'error': true,
			'msg': '没有返回值',
		}
	}
	const trains_data = JSON.parse(str);
	if(trains_data.status === false){
		return {
			'error': true,
			'msg': '可能是输入不正确',
		}
	}
	if(trains_data.messages.length){
		return {
			'error': true,
			'msg': trains_data.messages.join('<br />'),
		}
	}

	return {
		'error': false,
		'map': trains_data.data.map,
		'trains': trains_data.data.result.map(val=>parse_train_result(val)),
	}

}

function parse_station_names(str){
	if(typeof str !== 'string'){
		console.log(str);
		console.log('invalid station names');
		return -1;
	}

	const quote_begin = str.indexOf('\'');
	const quote_end = str.lastIndexOf('\'');

	if(quote_end === quote_begin && str[quote_begin+1] === '@'){
		console.log(str);
		throw new Error('invalid station names');
	}

	const station_names = str.slice(quote_begin+2, quote_end)
	.split('@')
	.map(station_name_str=>{
		const staion_name_parts = station_name_str.split('|');
		// station_name_str example
		// 'bjb|北京北|VAP|beijingbei|bjb|0'
		// 'bji|北京|BJP|beijing|bj|2'
		// split ->
		// 0                |1      |2   |3          |4                       |5
		// name_pinyin_short|name_zh|code|name_pinyin|name_pinyin_first_letter|order
		const station_name = {
			'name_zh': staion_name_parts[1],
			'code': staion_name_parts[2],
			'name_pinyin': staion_name_parts[3],
			'name_pinyin_first_letter': staion_name_parts[4],
		};
		return station_name;
	});

	return station_names;
}

function find_stations(str, opt){
	// opt = undefined | 'code' | 'name_zh'

	if(str === ''){
		return null;
	}
	if(!station_names){
		console.log('no station_names');
		return null;
	}

	if(opt === 'code'){
		return station_names.find(item=>item.code === str);
	}
	if(opt === 'name_zh'){
		return station_names.find(item=>item.name_zh === str);
	}

	const filtered_str = str.toLowerCase().replace(/[\s+'+]/g, '');
	return station_names.filter(item=>
		item.name_zh.startsWith(filtered_str) ||
		item.name_pinyin.startsWith(filtered_str) ||
		item.name_pinyin_first_letter.startsWith(filtered_str)
	);

}

function formatted_date(timestamp){
	// timestamp in millisecond
	// to YYYY-MM-DD
	const t = new Date(timestamp);
	let m = t.getMonth()+1;
	if(m < 10){
		m = '0' + m;
	}
	let d = t.getDate();
	if(d < 10){
		d = '0' + d;
	}
	return `${t.getFullYear()}-${m}-${d}`;
}

function search_train(date, from_station_code, to_station_code, adult_or_stu){
	const url = ticket_left_url(date, from_station_code, to_station_code, adult_or_stu);
	// console.log('search', Array.from(arguments));
	
	ReactDOM.render(
		<SearchResult url={url}/>,
		document.getElementsByClassName('search-result-section')[0],
	);
}

function search_result_table(res){
	return <table className="search_result">
		<caption>搜索结果</caption>
		<thead>
			<tr>
				<th>车次</th>
				<th>查询</th>
				<th>
					<div>出发</div>
					<div>到达</div>
				</th>
				<th>
					<div>出发时间</div>
					<div>到达时间</div>
				</th>
				<th>历时</th>
				<th>商务座</th>
				<th>特等座</th>
				<th>一等座</th>
				<th>二等座</th>
				<th>
					高级<br />
					软卧
				</th>
				<th>软卧</th>
				<th>硬卧</th>
				<th>软座</th>
				<th>硬座</th>
				<th>无座</th>
				<th>预订</th>
			</tr>
		</thead>
		<tbody>
			{res.trains.map(train=>(
				<tr key={train.train_no} id={train.train_no}>
					<td>{train.train_code}</td>
					<td>
						<button onClick={get_train_price.bind(this, 
							train.train_no, train.from_order, train.to_order,
							train.seat_types, train.train_start_day)
						}>查询价格</button>
					</td>
					<td>
						<div>{res.map[train.from]}</div>
						<div>{res.map[train.to]}</div>
					</td>
					<td>
						<div>{train.from_time}</div>
						<div>{train.to_time}</div>
					</td>
					<td>{train.lasted}</td>
					<td className="shangwuzuo">
						<div>{train.shangwuzuo}</div>
						<div className='price'></div>
					</td>
					<td className="tedengzuo">
						<div>{train.tedengzuo}</div>
						<div className='price'></div>
					</td>
					<td className="yidengzuo">
						<div>{train.yidengzuo}</div>
						<div className='price'></div>
					</td>
					<td className="erdengzuo">
						<div>{train.erdengzuo}</div>
						<div className='price'></div>
					</td>
					<td className="gaoruan">
						<div>{train.gaoruan}</div>
						<div className='price'></div>
					</td>
					<td className="ruanwo">
						<div>{train.ruanwo}</div>
						<div className='price'></div>
					</td>
					<td className="yingwo">
						<div>{train.yingwo}</div>
						<div className='price'></div></td>
					<td></td>
					<td className="yingzuo">
						<div>{train.yingzuo}</div>
						<div className='price'></div>
					</td>
					<td className="wuzuo">
						<div>{train.wuzuo}</div>
						<div className='price'></div>
					</td>
					<td>{
						train.buyable === 'Y'?
							<button>{train.bookable}</button>:
							<div>{train.bookable}</div>
					}</td>
				</tr>
			))}
		</tbody>
	</table>;
}

class SelectStationList extends React.Component{
	constructor(props) {
		super(props);
		this.selected_station = null;
		// console.log(props);
	}
	select_station(station){
		this.selected_station =  station;
		// console.log('setstate');
	}
	render(){
		return <ul className="station-list" onClick={this.props.onClick}>
			{(this.props['stations-list'] && this.props['stations-list'].length)? 
				this.props['stations-list'].map((item, i)=>
					<li key={item.code}
						onClick={this.select_station.bind(this, item)}
						className="choice">
						{item.name_zh}
					</li>
				):
				<li>无匹配</li>
			}
		</ul>
	}
}

class SearchArea extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			// input失焦时下拉选项消失计时器
			'blur_timeout': null,
			// 目前聚焦的input
			'focused-input': '',
			// 上次输入的input
			'inputing': '',
			// input显示的值，中文
			'train-from': '',
			'train-to': '',
			// 选择的火车站，对象引用
			'selected-from': null,
			'selected-to': null,
		}
	}

	search_search_text_change(ev){
		// input有输入时fire
		const input_text = ev.target.value;
		const input_name = ev.target.name;

		if(input_name === 'train-from'){
			this.setState({
				'selected-from': null,
				'train-from': input_text,
			});
			this.station_from_choices = find_stations(input_text);
		}
		if(input_name === 'train-to'){
			this.setState({
				'selected-to': null,
				'train-to': input_text,
			});
			this.station_to_choices = find_stations(input_text);
		}
	}

	input_focus_handler(stat, ev){
		// input得到焦点时有下拉选项，失焦时关闭下拉选项

		// stat = 'focus'| 'blur'

		const which = ev.target.name;
		if(stat === 'blur'){
			const blur_timeout = window.setTimeout(()=>{
				this.setState({
					'focused-input': '',
				});
			}, 200);
			this.setState({
				'blur_timeout': blur_timeout, 
			});
		}else{
			// state = 'focus'
			window.clearTimeout(this.state.blur_timeout);
			this.setState({
				'focused-input': which, 
				'inputing': which,
			});
		}
	}

	select_station(station){
		// 根据选择的车站在input上显示其中文名
		// console.log('click', station);
		if(this.state.inputing === 'train-from'){
			this.setState({
				'selected-from': station,
				'train-from': station.name_zh,
			});
		}
		if(this.state.inputing === 'train-to'){
			this.setState({
				'selected-to': station,
				'train-to': station.name_zh,
			});
		}
	}

	// date_change(ev){
	// 	this.setState({
	// 		date: formatted_date(ev.target.valueAsNumber), 
	// 	});
	// 	console.log(this.state);
	// }

	select_from_list(){
		this.select_station(this.select_station_list.selected_station);
	}

	submit_search(){
		// console.log(this);
		let station_from_code;
		// 检查车站
		if(this.state['select-from']){
			station_from_code = this.state['select-from'].code;
		}else{
			// 未在列表上选择车站但是有完整中文名
			if(this.state['train-from']){
				const station_from = find_stations(this.state['train-from'], 'name_zh');
				if(station_from){
					this.setState({
						'selected-from': station_from,
					});
					station_from_code = station_from.code;
				}else{
					alert('请输入出发站');
					return;
				}
			}else{
				alert('请输入出发站');
				return;
			}
		}

		let station_to_code;
		if(this.state['select-to']){
			station_to_code = this.state['select-to'].code;
		}else{
			if(this.state['train-to']){
				const station_to = find_stations(this.state['train-to'], 'name_zh');
				if(station_to){
					this.setState({
						'selected-to': station_to,
					});
					station_to_code = station_to.code;
				}else{
					alert('请输入到达站');
					return;
				}
			}else{
				alert('请输入到达站');
				return;
			}
		}

		// 检查日期
		const d = new Date(this.input_date.value).getTime();
		const dmin = new Date(this.input_date.min).getTime();
		if(d < dmin){
			alert('日期不合法');
			return;
		}

		// alert(station_from_code + ' to ' + station_to_code + ' at '
		// 	+ this.input_date.value + ', ' + (this.check_stu.checked?'student':'adult'));

		search_train(
			this.input_date.value,
			station_from_code,
			station_to_code,
			this.check_stu.checked? '0X00': 'ADULT'
		);
	}

	change_day(dir, ev){
		const t = new Date(this.input_date.value).getTime();
		if(dir === -1){
			// 前一天
			if(t <= new Date(this.input_date.min).getTime()){
				// console.log('不能再前');
				return;
			}else{
				
				this.input_date.value = formatted_date(t - 24*3600*1000);
				return;
			}
		}
		if(dir === 1){
			// 后一天
			if(t >= new Date(this.input_date.max).getTime()){
				return;
			}else{
				this.input_date.value = formatted_date(t + 24*3600*1000);
				return;
			}
		}
	}

	render(){
		return <div className="search-style">
			<div className="search-component">
				<label>
					出发：
					<input id="search-train-from"
						name="train-from" 
						type="text" 
						value={this.state['train-from']}
						onChange={this.search_search_text_change.bind(this)}
						onFocus={this.input_focus_handler.bind(this, 'focus')}
						onBlur={this.input_focus_handler.bind(this, 'blur')} />

				</label>

				{(this.state['focused-input'] === 'train-from')?
					<SelectStationList stations-list={this.station_from_choices}
						ref={list=>this.select_station_list = list}
						onClick={this.select_from_list.bind(this, 'train-from')}
					/>:
					null
				}
				{/*(this.state['focused-input'] === 'train-from')?
					(<ul>
						{(this.station_from_choices && this.station_from_choices.length)? 
							this.station_from_choices.map((item, i)=>
								<li onClick={this.select_station.bind(this, item)}>
									{item.name_zh}
								</li>
							):
							<li>无匹配</li>
						}
					</ul>):
					null
				*/}
			</div>

			<div className="search-component">
				<label>
					到达：
					<input id="search-train-to"
						name="train-to" 
						type="text" 
						value={this.state['train-to']}
						onChange={this.search_search_text_change.bind(this)}
						onFocus={this.input_focus_handler.bind(this, 'focus')}
						onBlur={this.input_focus_handler.bind(this, 'blur')} />

				</label>

				{(this.state['focused-input'] === 'train-to')?
					<SelectStationList stations-list={this.station_to_choices}
						ref={list=>this.select_station_list = list}
						onClick={this.select_from_list.bind(this, 'train-to')}
					/>:
					null
				}
				{/*(this.state['focused-input'] === 'train-to')?
					(<ul>
						{(this.station_to_choices && this.station_to_choices.length)? 
							this.station_to_choices.map((item, i)=>
								<li onClick={this.select_station.bind(this, item)}>
									{item.name_zh}
								</li>
							):
							<li>无匹配</li>
						}
					</ul>):
					null
				*/}
			</div>
			<div className="search-component">
				<label>
					日期：
					<input type="date" min={formatted_date(Date.now())}
						max={formatted_date(Date.now()+60*24*3600*1000) /* 限制60天 
						value={formatted_date(Date.now())}
						onChange={(ev)=>console.dir(ev.target)}
						*/}
						ref={input=>{
							if(!this.input_date){
								/* console.dir(input); */
								this.input_date=input;
								input.value=formatted_date(Date.now());
							}
						}}
					/>
					<br />
					<button onClick={this.change_day.bind(this, -1)}>
						前一天
					</button>
					<button onClick={this.change_day.bind(this, +1)}>
						后一天
					</button>
				</label>
			</div>
			<div className="search-component">
				<label>
					学生票
					<input type="checkbox"
						ref={check=>this.check_stu=check}
					/>
				</label>
			</div>
			<div className="search-component">
				<button onClick={this.submit_search.bind(this)}>查询</button>
			</div>
		</div>;
	}
}

class SearchResult extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			'url': this.props.url,
			'ready': 0,
			'error': 0,
			'result': null,
		};
		this.refresh();
	}
	componentWillReceiveProps(nextProps){
		this.setState({
			'url': nextProps.url,
			'ready': 0,
		}, this.refresh);
		
	}
	refresh(){
		poster(transferor_url, {}, `url=${encodeURIComponent(this.state.url)}`).then(val=>{
			const search_result = parse_train_search(val);
			if(search_result.error){
				this.setState({
					'ready': -1,
					'error': search_result.msg,
				});
			}else{
				this.setState({
					'ready': 1,
					'result': search_result,
				});
			}
		});
	}
	render(){
		if(this.state.ready === 0){
			return <p>加载中</p>;
		}
		if(this.state.ready === 1){
			return search_result_table(this.state.result);

			// return <div>
			// 	<p>done</p>
			// 	<p>{JSON.stringify(this.state.result)}</p>
			// </div>;
		}
		if(this.state.ready === -1){
			return <div>
				<p>error</p>
				<p>{this.state.error}</p>
			</div>;
		}
	}
}

class SearchSection extends React.Component{
	constructor(props){
		super(props);

		// state.ready 
		// 0: loading
		// 1: done
		// -1: error
		this.state = {'ready': 0};
		// this.state = {'ready': 1};
		// return;

		poster(transferor_url, {}, `url=${encodeURIComponent(station_names_url)}`)
		.then(val=>{
			// console.log(val);
			station_names = parse_station_names(val);
			if(station_names === -1){
				throw new Error('parse station name error');
			}
		}).then(val=>{
			this.setState({
				'ready': 1,
			});

		}).catch(reason=>{
			this.setState({
				'ready': -1,
				'error': reason,
			});
		});
	}
	render(){
		if(this.state.ready === 0){
			return <p>正在加载车站信息</p>;
		}

		if(this.state.ready === 1){
			// return <div>
			// 	{station_names.map((val, i)=><div>{`${i}.${val.name_zh}`}</div>)}
			// </div>;
			return <div>
				<SearchArea />
			</div>
		}

		if(this.state.ready === -1){
			return <div>
				<p>error</p>
				<p>reason: {this.state.error}</p>
			</div>;
		}
	}
}

ReactDOM.render(
	<SearchSection />,
	document.getElementsByClassName('search-section')[0]
);