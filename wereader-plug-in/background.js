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

//获取书评
function getComment(url,bookId,isHtml){
	getData(url,function(data){
		var r = RegExp(bookId + "[\\s\\S]*?\"isPrivate\":0");
		try{
			var commentData = r.exec(data)[0];
		}catch{
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

//打开登录界面
function newPage(url){
	chrome.tabs.create({url: url});
}

//获取vid
function getuserVid(){
	return document.getElementById("userVid").value;
}

//获取bid
function getbookId(){
	return document.getElementById('bookId').value;
}

//监听来自content-script的消息：是不是在BookPage、是的话bid是多少
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if(request.isBookPage == "1"){//如果在BookPage
		//设置从content获取的bid
		document.getElementById('bookId').value = request.bid;
		//设置vid
		setuserVid();
		sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
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
			chrome.browserAction.setPopup({ popup: 'popup.html' });
			chrome.tabs.sendMessage(tab.id, {getBid: "true"}, function(response){
				if(response != undefined){
					document.getElementById('bookId').value = response;
				}
				setuserVid();
			});
			//用于处理无content.js注入的情况（刚打开插件且直接切换到已经打开的BookPage上的情况）
			if(document.getElementById('bookId').value == "null" && document.getElementById('bookId').value == "null"){
				chrome.tabs.executeScript(tab.id, {file: 'inject-bid.js'});
			}
		}
	});
});

//页面监控：是否发生更新
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
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
			chrome.tabs.sendMessage(tabId, {getBid: "true"}, function(response){
				document.getElementById('bookId').value = response;
				setuserVid();
			});
			chrome.browserAction.setPopup({ popup: 'popup.html' });
	}
});