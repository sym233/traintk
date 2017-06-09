import React from 'react';
import ReactDOM from 'react-dom';

import urls from './urls.js';
import poster from './poster.js';

import ResultTr from './result-table.js';


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

function search_result_table(res){
  return <table className="search_result">
    <caption>搜索结果</caption>
    <ResultTr is-head={true} />
    <tbody>
      {res.trains.map(train=>(
        <ResultTr key={train.train_no} res-map={res.map} train={train} />
      ))}
    </tbody>
  </table>;
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
    poster(urls.transferor, {}, `url=${encodeURIComponent(this.state.url)}`).then(val=>{
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
      //  <p>done</p>
      //  <p>{JSON.stringify(this.state.result)}</p>
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

export default SearchResult;