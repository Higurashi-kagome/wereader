//获取数据
function getData(url,callback){
	var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
	httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
	httpRequest.withCredentials = true;
	httpRequest.send();//第三步：发送请求  将请求参数写在URL中
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		var data = httpRequest.responseText;//获取到json字符串，还需解析
		callback(data);
	};
}

//复制内容
function copy(text){
	var inputText = document.getElementById("formatted_text");
	var copyBtn = document.getElementById("btn_copy");
	var clipboard = new Clipboard('.btn');
	clipboard.on('success', function (e) {
		console.log(e);
	});
	clipboard.on('error', function (e) {
		console.log(e);
		alert(e);
	});
	inputText.innerHTML = text;
	copyBtn.click();
}

//获取书评
function getComment(url,bookId,isHtml){
	getData(url,function(data){
		var r = RegExp(bookId + "[\\s\\S]*?\"isPrivate\":0");
		try{
			var commentData = r.exec(data)[0];
		}catch{
			alert("无书评，可能原因：此书无书评/插件暂不支持公众号");
			return;
		}
		var comment = commentData.replace(/"isPrivate":[\s\S]*/,"").replace(/"friendship":[\s\S]*?,/,"").replace(/"bookVersion":[\s\S]*?,/,"");
		var content = /"content[\s\S]*"htmlContent"/.exec(comment)[0].slice(11,-15).replace(/\\n/g,"\n\n");
		var htmlContent = /"htmlContent[\s\S]*/.exec(comment)[0].slice(15,-2);
		if(isHtml == true){
			copy(htmlContent);
		}else{
			copy(content);
		}
	});
}

//获取目录
function getBookContents(){
	chrome.tabs.query({active:true}, function(tab){
		chrome.tabs.executeScript(tab.id, {file: 'inject-contents.js'});
	});
}

//popup获取vid
function getuserVid(){
	return document.getElementById("userVid").value;
}

//popup获取bid
function getbookId(){
	return document.getElementById('bookId').value;
}

//获取userVid并设置为input值
function setuserVid(){
	//获取当前页面
	chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
		var url = tabs[0].url;
		//获取当前页面的cookie然后设置bookId和userVid
		chrome.cookies.get({
			url: url,
			name: 'wr_vid'
		},function(cookie){
			if(cookie == null){
				console.log("BookPage获取cookie失败，请检查");
				document.getElementById('userVid').value = "null";
			}else{
				var userVid = cookie.value.toString();
				console.log("userVid为：" + userVid);
				document.getElementById('userVid').value = userVid;
			}
		});
	});
}

//获取标题前缀
function getTitlePre(level){
	if(level == "1"){
		return document.getElementById("level1").value;
	}else if(level == "2"){
		return document.getElementById("level2").value;
	}else if(level == "3"){
		return document.getElementById("level3").value;
	}
}

//监听来自inject.js、option的消息：是不是在BookPage、是的话bid是多少；如何设置变量
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if(request.getBid == true){
		//设置从content获取的bid
		document.getElementById('bookId').value = request.bid;
		//设置vid
		setuserVid();
		sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
	}else if(request.getContents == true){
		var texts = request.contents;
		sendResponse('我是后台，我已收到你的消息，消息有点长，就不详细回复了！');
	}else if(request.getSetting == true){//获取设置的消息
		sendResponse(
				{
				s1Pre: document.getElementById("style1Pre").value, 
				s1Suf: document.getElementById("style1Suf").value, 
				s2Pre: document.getElementById("style2Pre").value, 
				s2Suf: document.getElementById("style2Suf").value, 
				s3Pre: document.getElementById("style3Pre").value, 
				s3Suf: document.getElementById("style3Suf").value, 
				lev1: document.getElementById("level1").value, 
				lev2: document.getElementById("level2").value, 
				lev3: document.getElementById("level3").value, 
				thouPre: document.getElementById("thoughtPre").value, 
				thouSuf: document.getElementById("thoughtSuf").value, 
				displayN: document.getElementById("displayNumber").value
				}
			);
	}else if(request.set == true){//设置变量的消息
		if(request.s1Pre != undefined){
			document.getElementById("style1Pre").value = request.s1Pre;
		}
		if(request.s1Suf != undefined){
			document.getElementById("style1Suf").value = request.s1Suf;
		}
		if(request.s2Pre != undefined){
			document.getElementById("style2Pre").value = request.s2Pre;
		}
		if(request.s2Suf != undefined){
			document.getElementById("style2Suf").value = request.s2Suf;
		}
		if(request.s3Pre != undefined){
			document.getElementById("style3Pre").value = request.s3Pre;
		}
		if(request.s3Suf != undefined){
			document.getElementById("style3Suf").value = request.s3Suf;
		}
		if(request.lev1 != undefined){
			document.getElementById("level1").value = request.lev1;
		}
		if(request.lev2 != undefined){
			document.getElementById("level2").value = request.lev2;
		}
		if(request.lev3 != undefined){
			document.getElementById("level3").value = request.lev3;
		}
		if(request.thouPre != undefined){
			document.getElementById("thoughtPre").value = request.thouPre;
		}
		if(request.thouSuf != undefined){
			document.getElementById("thoughtSuf").value = request.thouSuf;
		}
		if(request.displayN != undefined){
			if(document.getElementById("displayNumber").value == "true"){
				document.getElementById("displayNumber").value = "false";
			}else{
				document.getElementById("displayNumber").value = "true";
			}
		}
	}
});

//页面监测：是否在已打开页面之间切换
chrome.tabs.onActivated.addListener(function(moveInfo){
	chrome.tabs.get(moveInfo.tabId,function(tab){
		var currentUrl = tab.url;
		var list = currentUrl.split('/');
		var isBookPage = false;
		try{
			if(list[2] == "weread.qq.com" && list[3] == "web" && list[4] == "reader" && list[5] != ""){
				isBookPage = true;
			}
		}catch(err){
			isBookPage = false;
		}
		if(isBookPage != true){//如果当前页面为其他页面
			document.getElementById('bookId').value = "null";
			document.getElementById('userVid').value = "null";
			chrome.browserAction.setPopup({ popup: '' });
		}else{
			chrome.tabs.executeScript(tab.id, {file: 'inject-bid.js'});
			chrome.browserAction.setPopup({ popup: 'popup.html' });
			setuserVid();
		}
	});
});

//页面监控：是否发生更新
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(changeInfo.status == "loading"){
		var loadingUrl = tab.url;
		var list = loadingUrl.split('/');
		var isBookPage = false;
		try{
			if(list[2] == "weread.qq.com" && list[3] == "web" && list[4] == "reader" && list[5] != ""){
				isBookPage = true;
			}
		}catch(err){
			isBookPage = false;
		}
		if(isBookPage != true){//如果当前页面为其他页面
			document.getElementById('bookId').value = "null";
			document.getElementById('userVid').value = "null";
			chrome.browserAction.setPopup({ popup: '' });
		}else{
			chrome.tabs.executeScript(tab.id, {file: 'inject-bid.js'});
			setuserVid();
			chrome.browserAction.setPopup({ popup: 'popup.html' });
			}
	}

});