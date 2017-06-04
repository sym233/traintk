import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import urls from './urls.js';
import poster from './poster.js';

import SearchArea from './search-area.js';

// ==========================================

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

let station_names;

ReactDOM.render(
  <p>正在加载车站信息</p>,
  document.getElementsByClassName('search-section')[0]
);

poster(urls.transferor, {}, `url=${encodeURIComponent(urls.station_names)}`).then(val=>{
  // console.log(val);
  station_names = parse_station_names(val);
  if(station_names === -1){
    throw new Error('parse station name error');
  }
}).then(val=>{
  ReactDOM.render(
    <SearchArea station-names={station_names}/>,
    document.getElementsByClassName('search-section')[0]
  );
}).catch(reason=>{
  ReactDOM.render(
    <p>错误：{reason}</p>,
    document.getElementsByClassName('search-section')[0]
  );
});
