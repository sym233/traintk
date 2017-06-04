// search-area
import React from 'react';
import ReactDOM from 'react-dom';

import urls from './urls.js';
import poster from './poster.js';

import SearchResult from './search-result.js';
import {find_stations, formatted_date} from './tools.js';

let station_names;

function search_train(date, from_station_code, to_station_code, adult_or_stu){
  const url = urls.ticket_left(date, from_station_code, to_station_code, adult_or_stu);
  // console.log('search', Array.from(arguments));
  
  ReactDOM.render(
    <SearchResult url={url}/>,
    document.getElementsByClassName('search-result-section')[0],
  );
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

    station_names = props['station-names'];

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
      this.station_from_choices = find_stations(station_names, input_text);
    }
    if(input_name === 'train-to'){
      this.setState({
        'selected-to': null,
        'train-to': input_text,
      });
      this.station_to_choices = find_stations(station_names, input_text);
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
  //  this.setState({
  //    date: formatted_date(ev.target.valueAsNumber), 
  //  });
  //  console.log(this.state);
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
        const station_from = find_stations(station_names, this.state['train-from'], 'name_zh');
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
        const station_to = find_stations(station_names, this.state['train-to'], 'name_zh');
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
    //  + this.input_date.value + ', ' + (this.check_stu.checked?'student':'adult'));

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
      <div className="search-component search-date">
        <label>
          <div className="date-component-container">
            <div>日期：</div>
            <div>
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
              <div className="change-day-btn">
                <button onClick={this.change_day.bind(this, -1)}>
                  前一天
                </button>
                <button onClick={this.change_day.bind(this, +1)}>
                  后一天
                </button>
              </div>
            </div>
          </div>
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

export default SearchArea;