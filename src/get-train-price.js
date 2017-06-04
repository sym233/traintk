// get-train-price

import urls from './urls.js';
import poster from './poster.js';

function get_train_price(train_no, from_order, to_order, seat_types, date){
  const new_date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
  console.log(Array.from(arguments));
  const url = urls.ticket_price(train_no, from_order, to_order, seat_types, new_date);
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
      throw new Error('DOM未正确加载');
    }
  }
  
  poster(urls.transferor, {}, `url=${encodeURIComponent(url)}`).then(val=>{
    if(!val || val === -1){
      throw new Error('返回错误');
    }
    const parsed = JSON.parse(val);
    if(!parsed.status){
      throw new Error('数据错误');
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

export default get_train_price;