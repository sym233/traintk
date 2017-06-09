// result-table
import React from 'react';
import ReactDOM from 'react-dom';


import get_train_price from './get-train-price.js';
import TrainDetail from './train-detail.js';

const table_head = (
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
</thead>);

const table_tr = (res_map, train)=>(
<tr id={train.train_no}>
  <td>{train.train_code}</td>
  <td>
    <div>
      <button onClick={get_train_price.bind(this, 
        train.train_no, train.from_order, train.to_order,
        train.seat_types, train.train_start_day)
      }>查询价格</button>
    </div>
    {/*<button onClick={train_detail.bind(null, train.train_no)}>
    经停站点
    </button>
    <div className="train-detail-box" id={`train_detail_${train.train_no}`}>
  */}
  
    <TrainDetail train-no={train.train_no} train-from={train.from}
      train-to={train.to} depart-date={train.train_start_day}
    />
  </td>
  <td>
    <div>{res_map[train.from]}</div>
    <div>{res_map[train.to]}</div>
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
      (train.bookable === '预订'?
        <div>不可预订</div>:
        <div>{train.bookable}</div>
      )
  }</td>
</tr>);

class ResultTr extends React.Component{
  constructor(props) {
    super(props);
  }

  render(){
    if(this.props['is-head'] === true){
      return table_head;
    }else{
      if(this.props.train){
        return table_tr(this.props['res-map'], this.props.train);
      }else{
        throw new Error('搜索结果表格错误');
      }
    }
  }
}

export default ResultTr;