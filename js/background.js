var flag=true;
var reg = /^((http|https|ftp):\/\/)?(\w(\:\w)?@)?([0-9a-z_-]+\.)*?([a-z0-9-]+\.[a-z]{2,6}(\.[a-z]{2})?(\:[0-9]{2,6})?)((\/[^?#<>\/\\*":]*)+(\?[^#]*)?(#.*)?)?$/i;
var i,target,links,count;


/*
function showNotice(t,c){
	chrome.notifications.create('aqy',{type:"basic",iconUrl:"../2.jpg",title:t,message:c},null);
}
*/
function strTime(){
	var d = new Date();
	var s = "";
	var c = ":";
	s += d.getHours() + c;
	s += d.getMinutes() + c;
	s += d.getSeconds() + c;
	s += d.getMilliseconds();
	return(s);
}

function visit(links){
	count = links.length;
	//chrome.notifications.create('aqyp',{type:"progress",iconUrl:"../2.jpg",title:strTime(),message:"开始URL轮询",progress:0},null);
	//更新页面
	i = setInterval(function(){
		if(links.length>0){
			var next = links.pop()
			chrome.tabs.update(target.id, {url: next, active: false}, null);
			var p = parseInt(links.length/count);
			//chrome.notifications.create('aqyp',{type:"progress",iconUrl:"../2.jpg",title:strTime(),message:"还有"+links.length,progress:p},null);
		}
		//links空了
		else{
			//showNotice(strTime(),"所有URL访问完毕");
			clearInterval(i);
			//重新发
			send(target.id);
		}
	},3000);
}

function send(tid){
	//showNotice(strTime(),"send start to "+target.id);
	chrome.tabs.sendMessage(tid, {msg: "start"}, function(response) {
		if(response){
			links = response.urls;
			visit(links);
		}
		//无URL返回
		else{
			//showNotice(strTime(),"当前页无URL返回，重置页面");
			chrome.tabs.update(tid, {url: "http://zhidao.baidu.com", active: false}, function(){
				//等待5秒发消息
				setTimeout(function(){
					//showNotice(strTime(),"send start to "+tid);
					chrome.tabs.sendMessage(tid, {msg: "start"}, function(response){
						links = response.urls;
						visit(links);
					});
				},5000);
			});
		}
	});
}

chrome.browserAction.onClicked.addListener(function() {
	if(flag){
		flag=false;
		//chrome.notifications.create('aqy',{type:"basic",iconUrl:"../2.jpg",title:"自动开页面",message:"开始"},null);
		//找到当前活动tab
		chrome.tabs.query({active:true,currentWindow:true,status:"complete"},function(tabs){
			//找到了tab且tabURL正确
			if(tabs.length&&reg.test(tabs[0].url)){
				target = tabs[0];
				//showNotice(strTime(),"获得页面 tabid:"+target.id+", tabTitle:"+target.title);
				
				//等待5秒给特定tab发消息
				setTimeout(function(){
					send(target.id);
				},5000);
			}
			else{
				//没找到当前活动tab或当前tab的URL格式不正确
				//showNotice(strTime(),"当前页不正确，打开默认页");
				chrome.tabs.create({url:"http://zhidao.baidu.com",active:false},function(tab){
					target = tab;
					//showNotice(strTime(),"获得页面 tabid:"+target.id+", tabTitle:"+target.title);
					//等待5秒发消息
					setTimeout(function(){
						//showNotice(strTime(),"send start to "+target.id);
						chrome.tabs.sendMessage(target.id, {msg: "start"}, function(response){
							links = response.urls;
							visit(links);
						});
					},5000);

				});
			}
		});
	}
	else{
		//showNotice(strTime(),"用户手动停止");
		clearInterval(i);
		//chrome.tabs.remove(t);
		flag = true;
	}
});