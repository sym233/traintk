function find_stations(station_names, str, opt){
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


export {find_stations, formatted_date};