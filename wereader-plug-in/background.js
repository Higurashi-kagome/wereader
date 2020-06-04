function getData(){
	var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
	httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
	httpRequest.withCredentials = true;
	httpRequest.send();//第三步：发送请求  将请求参数写在URL中
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		var data = httpRequest.responseText;//获取到json字符串，还需解析
		console.warn(data);
		return data;
	};
}


function getComment(url){
	var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
	httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
	httpRequest.withCredentials = true;
	httpRequest.send();//第三步：发送请求  将请求参数写在URL中
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		var data = httpRequest.responseText;//获取到json字符串，还需解析
		var commentData = /"bookId"[\s\S]*?"isPrivate":0/.exec(data)
		var s = new String(commentData);
		var comment = s.replace(/"isPrivate":[\s\S]*/,"").replace(/"friendship":[\s\S]*?,/,"").replace(/"bookVersion":[\s\S]*?,/,"");
		console.warn(comment);
		var bookId = /"bookId"[\s\S]*?,/.exec(comment)[0].slice(10,-2);
		var content = /"content[\s\S]*"htmlContent"/.exec(comment)[0].slice(11,-15);
		var htmlContent = /"htmlContent[\s\S]*/.exec(comment)[0].slice(15,-2);
		console.warn(bookId);
		console.warn(content);
		console.warn(htmlContent);
		return {"bookId":bookId,"content":content,"htmlContent":htmlContent}
	};
}

function isLogin(){
	chrome.cookies.get({
		url: 'https://weread.qq.com/',
		name: 'wr_vid'
	},function(cookie){
		if(cookie == null){
			console.warn("null");
			return "null";
		}else{
			var userVid = cookie.value.toString();
			console.warn(userVid);
			return userVid;
		}
	});
}

function test(){
	chrome.cookies.get({
		url: 'https://www.cnblogs.com/',
		name: 'pgv_pvi'
	},function(cookie){
		if(cookie == null){
			console.warn("null");
			return "null";
		}else{
			var userVid = cookie.value.toString();
			console.warn(userVid);
			return userVid;
		}
	});
}

function newPage(url){
	chrome.tabs.create({url: url});
}


// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.warn('收到来自content-script的消息：');
	console.warn(request, sender, sendResponse);
	console.warn(JSON.stringify(request));
	sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});