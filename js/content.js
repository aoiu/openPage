var links = new Array();

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

function my(){
	links = [];
	var reg = /^((http|https|ftp):\/\/)?(\w(\:\w)?@)?([0-9a-z_-]+\.)*?([a-z0-9-]+\.[a-z]{2,6}(\.[a-z]{2})?(\:[0-9]{2,6})?)((\/[^?#<>\/\\*":]*)+(\?[^#]*)?(#.*)?)?$/i;
	var tmp;
	$.each($("a"),function(i,n){
		if(reg.test(n.href)){
			links.push(n.href);
		}
	});
	return links;
}

chrome.runtime.onMessage.addListener(
	function(request,sender,sendResponse){
		if(request.msg=="start"){
			sendResponse({urls:my()});
		}
});