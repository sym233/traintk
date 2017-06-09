// train_detail
import React from 'react';
import ReactDOM from 'react-dom';

import urls from './urls.js';
import poster from './poster.js';

// function train_detail(train_no){
//  const target_id = `train_detail_${train_no}`;
//  const target = document.getElementById(target_id);
//  target.innerHTML = 'detail';
// }
function parse_train_detail(response){
  if(response === ''){
    throw new Error('没有收到经停信息');
  }
  let val;
  try{
    const json = JSON.parse(response);
    if(json.status === false){
      throw new Error('返回错误');
    }
    val = json.data.data;
  }catch(e){
    throw e;
  }
  return val;
}



class TrainDetail extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      'show': false,
      'ready': 0,
      'first-load': true,
    };
    
  }

  toggle_show(){
    this.setState({
      'show': !this.state.show,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextState.ready !== 0){
      return true;
    }
    if(nextState['first-load']){
      this.setState({
        'first-load': false,
        'detail': null,
        'error': '',
      });

      // 'YYYYMMDD' to 'YYYY-MM-DD'
      const date = `${this.props['depart-date'].slice(0, 4)}-${this.props['depart-date'].slice(4, 6)}-${this.props['depart-date'].slice(6, 8)}`;

      poster(urls.transferor, {},
        `url=${encodeURIComponent(urls.train_detail(
          this.props['train-no'],
          this.props['train-from'],
          this.props['train-to'],
          date))}`
      ).then(val=>{
        const detail = (<table className='train-detail-table'>
          <thead>
            <tr>
              <th>站序</th>
              <th>到达时间</th>
              <th>到站</th>
              <th>停车时间</th>
              <th>开车时间</th>
            </tr>
          </thead>
          <tbody>{
            parse_train_detail(val).map(val=>
            <tr key={val.station_no} className={val.isEnabled===false?'grey':''}>
              <td>{val.station_no}</td>
              <td>{val.arrive_time}</td>
              <td>{val.station_name}</td>
              <td>{val.stopover_time}</td>
              <td>{val.start_time}</td>
            </tr>)
          }
          </tbody>
        </table>);

        this.setState({
          'ready': 1,
          'detail': detail,
        });
      }).catch(reason=>{
        this.setState({
          'ready': -1,
          'error': reason,
        });
      });
      return true;
    }
    if(nextState.show !== this.state.show){
      return true;
    }
    return false;
  }

  render(){
    return <div>
      {this.state.show?
        <button onClick={this.toggle_show.bind(this)}>隐藏经停</button>:
        <button onClick={this.toggle_show.bind(this)}>经停站点</button>
      }
      <div className={"train-detail-box"+(this.state.show?'':' notdisp')}>
        {this.state.ready === 0?'加载中...':(
          this.state.ready === 1?
            this.state.detail:
            `错误：${this.state.error}`
        )}
      </div>
    </div>;
  }
}

export default TrainDetail;