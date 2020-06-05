//获取数据
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
		return data;
	};
}

//在主页面获取userVid并设置为input值，uservid按情况设置，bookId一律设置为"null"
function setuserVid1(){
	chrome.cookies.get({
		url: 'https://weread.qq.com/',
		name: 'wr_vid'
	},function(cookie){
		if(cookie == null){
			console.warn("主页面获取userVid失败，请登录");
			document.getElementById('userVid').value = "null";
			document.getElementById('bookId').value = "null";
		}else{
			var userVid = cookie.value.toString();
            console.warn(userVid);
			document.getElementById('userVid').value = userVid;
			document.getElementById('bookId').value = "null";
		}
    });
}

//在BookPage获取userVid并设置为input值
function setuserVid2(){
	//获取当前页面
	chrome.tabs.getSelected(null, function(tab){
		var url = tab.url;
		//获取当前页面的cookie然后设置bookId和userVid
		chrome.cookies.get({
			url: url,
			name: 'wr_vid'
		},function(cookie){
			if(cookie == null){
				console.warn("BookPage获取cookie失败，请检查");
			}else{
				var userVid = cookie.value.toString();
				console.warn(userVid);
				document.getElementById('userVid').value = userVid;
				console.warn(document.getElementById('userVid').value);
			}
		});
	});
}

//获取书评
function getComment(url){
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', url, true);
	httpRequest.withCredentials = true;
	httpRequest.send();
	httpRequest.onreadystatechange = function () {
		var data = httpRequest.responseText;
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

//打开登录界面
function newPage(url){
	chrome.tabs.create({url: url});
}


//监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if(request.isHomePage == "1"){//如果在主页面(HomePage)
		setuserVid1();
	}else if(request.isBookPage == "1"){//如果在BookPage
		//设置从content获取的bid
		document.getElementById('bookId').value = request.bid;
		//设置vid
		setuserVid2()
		console.warn(document.getElementById('bookId').value);
		console.warn(document.getElementById('userVid').value);
		sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
	}
});


function getuserVid(){
	return document.getElementById("userVid").value;
}

function getbookId(){
	return document.getElementById('bookId').value;
}

function getCurrentPage(){
	chrome.tabs.getSelected(null, function(tab){
		var url = tab.url;
		document.getElementById('currentPage').value = url;
	});
	return document.getElementById('currentPage').value;
}

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
			chrome.browserAction.setPopup({ popup: 'popup.html' });
	}
});