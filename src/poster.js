// poster

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

export default poster;