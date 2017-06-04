// urls


// const transferor_url = 'http://127.0.0.1/transferor/transferor.php';
const transferor_url = 'http://115.159.213.127/transferor/transferor.php';

const station_names_ver = '1.8902';

const station_names_url = `https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?\
station_version=${station_names_ver}`;

const ticket_left_url = (date, from_station_code, to_station_code, adult_or_stu)=>
// date: YYYY-MM-DD
// adult_or_stu: 'ADULT' or '0X00'(?)
`https://kyfw.12306.cn/otn/leftTicket/query?\
leftTicketDTO.train_date=${date}&\
leftTicketDTO.from_station=${from_station_code}&\
leftTicketDTO.to_station=${to_station_code}&\
purpose_codes=${adult_or_stu}`;

const ticket_price_url = (train_no, from_order, to_order, seat_types, date)=>
`https://kyfw.12306.cn/otn/leftTicket/queryTicketPrice?\
train_no=${train_no}&\
from_station_no=${from_order}&\
to_station_no=${to_order}&\
seat_types=${seat_types}&\
train_date=${date}`;

const train_detail_url = (train_no, from_station_code, to_station_code, depart_date)=>
// 710000K1580Q LZZ BXP 2017-06-05
`https://kyfw.12306.cn/otn/czxx/queryByTrainNo?\
train_no=${train_no}&\
from_station_telecode=${from_station_code}&\
to_station_telecode=${to_station_code}&\
depart_date=${depart_date}`;

const urls = {
	'transferor': transferor_url,
	'station_names': station_names_url,
	'ticket_left': ticket_left_url,
	'ticket_price': ticket_price_url,
	'train_detail': train_detail_url,
};

export default urls;