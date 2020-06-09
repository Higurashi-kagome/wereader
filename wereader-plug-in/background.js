//popup获取vid：OK
function getuserVid(){
	return document.getElementById("userVid").value;
}

//popup获取bid：OK
function getbookId(){
	return document.getElementById('bookId').value;
}

//获取userVid并设置到背景页：OK
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

//获取数据：OK
function getData(url,callback){
	var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
	httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
	httpRequest.withCredentials = true;
	httpRequest.send();//第三步：发送请求  将请求参数写在URL中
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState==4 && httpRequest.status==200){
			var data = httpRequest.responseText;//获取到json字符串，还需解析
			callback(data);
		}
	};
}

//复制内容：OK
function copy(text){
	var inputText = document.getElementById("formatted_text");
	var copyBtn = document.getElementById("btn_copy");
	var clipboard = new Clipboard('.btn');
	clipboard.on('success', function (e) {
		console.log("复制成功" + JSON.stringify(e));
	});
	clipboard.on('error', function (e) {
		console.log("复制出错" + JSON.stringify(e));
		alert("复制出错" + JSON.stringify(e));
	});
	inputText.innerHTML = text;
	copyBtn.click();
}

//获取书评：OK
function getComment(url,bookId,isHtml){
	getData(url,function(data){
		var r = RegExp(bookId + "[\\s\\S]*?\"isPrivate\":0");
		try{
			var commentData = r.exec(data)[0];
		}catch{
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

//获取目录：OK
function getBookContents(){
	console.log("getBookContents被调用")
	chrome.tabs.query({active:true}, function(tab){
		chrome.tabs.executeScript(tab.id, {file: 'inject-contents.js'});
	});
}

/*//获取标题前缀
function getTitlePre(){
	if(request.lev1 != undefined){
		document.getElementById("level1").innerHTML = request.lev1;
	}
	if(request.lev2 != undefined){
		document.getElementById("level2").innerHTML = request.lev2;
	}
	if(request.lev3 != undefined){
		document.getElementById("level3").innerHTML = request.lev3;
	}
}*/

//获取标注
function getBookMarks(url,isAll){
	getData(url,function(data){
		console.log("isAll:" + isAll)
		//获取章节并排序
		var chapterData =  data.match(/"chapterUid":[0-9]*,"chapterIdx":[0-9]*?,"title":"[\s\S]*?"/g);
		if(chapterData == null){
			console.log("获取章节失败")
			return
		}
		var chapterList = [];
		for(i=0,len=chapterData.length;i<len;i++){
			var str = "{" + chapterData[i] +"}";
			chapterList.push(JSON.parse(str));
		}
		var colId = "chapterUid";
		var asc = function(x,y){
			return (x[colId] > y[colId]) ? 1 : -1
		}
		chapterList.sort(asc);
		//获取标注
		for(var i=0,len1=chapterList.length;i<len1;i++){
			//获取章内标注
			var chapterUid = chapterList[i].chapterUid.toString();
			var r = RegExp("\"chapterUid\":" + chapterUid + "[\\s\\S]*?\"createTime\"","g");
			var chapterMarkList = data.match(r);
			//处理(去除多余字符、排序)章内标注并加入到章节内
			var chapterMarkArray = [];
			for(var j=0,len2=chapterMarkList.length;j<len2;j++){
				var str = "{" + chapterMarkList[j].replace("\"range\":\"","\"range\":").replace(/-[0-9]*?"/,"").replace(",\"createTime\"","") + "}";
				chapterMarkArray.push(JSON.parse(str));
			}
			var colId = "range";
			chapterMarkArray.sort(asc);
			chapterList[i].marks = chapterMarkArray;
		}
		//遍历标注得到res
		res = '';
		//获取目录
		//遍历章节
		for(var i=0,len1=chapterList.length;i<len1;i++){
			var getMarkPre = function(style){
				if(style == 0){
					return document.getElementById("style1Pre").innerHTML;
				}else if(style == 1){
					return document.getElementById("style2Pre").innerHTML;
				}else if(style == 2){
					return document.getElementById("style3Pre").innerHTML;
				}
			};
			var getMarkSuf = function(style){
				if(style == 0){
					return document.getElementById("style1Pre").innerHTML;
				}else if(style == 1){
					return document.getElementById("style2Suf").innerHTML;
				}else if(style == 2){
					return document.getElementById("style3Suf").innerHTML;
				}
			};
			var getTitleAddedPre = function(title){
				var bookContents = document.getElementById("Bookcontents").innerHTML;
				if(bookContents != "Bookcontents"){
					var r = RegExp("\n.*?" + title + "[\\s\\S]*?\n");
					var titleAddedPre = bookContents.match(r)[0].replace("\n","");
					return titleAddedPre;
				}else{
					console.warn("获取目录失败：Bookcontents")
					return "获取目录失败：Bookcontents"
				}
			}
			var title = chapterList[i].title;
			//导入本章还是导入全部
			if(isAll == true){
				res += getTitleAddedPre(title) + "\n\n";
				var marks = chapterList[i].marks;
				//遍历章内标注
				for(var j=0,len2=marks.length;j<len2;j++){
					res += getMarkPre(marks[j].style) + marks[j].markText + getMarkSuf(marks[j].style) + "\n\n";
				}
			}else{
				if(document.getElementById("currentContent").innerHTML.indexOf(title) != -1){
					res += getTitleAddedPre(title) + "\n\n";
					var marks = chapterList[i].marks;
					//遍历章内标注
					for(var j=0,len2=marks.length;j<len2;j++){
						res += getMarkPre(marks[j].style) + marks[j].markText + getMarkSuf(marks[j].style) + "\n\n";
					}
					break
				}else{
					continue
				}
			}
			
		}
		copy(res);
	});
}

//获取想法
function getMyThought(url){
	getData(url,function(data){
		var json = JSON.parse(data)
		console.log("json:" + JSON.stringify(json))
		//获取章节并排序
		var chapterList = Array.from(new Set(data.match(/"chapterUid":[0-9]*/g)))
		var colId = "chapterUid";
		var asc = function(x,y){
			return (x[colId] > y[colId]) ? 1 : -1
		}
		chapterList.sort(asc)
		console.log("chapterList:" + chapterList)
		//遍历章节
		for(var i=0,len1=chapterList.length;i<len1;i++){
			var index = chapterList[i].indexOf(":")
			var chapterUid = chapterList[i].slice(index+1)
			console.log("chapterUid:" + chapterUid)
			for(var item in json.reviews){
				if(item.review.chapterUid == chapterUid){
					var abstract = item.review.abstract
					var content = item.review.content
				}
			}
			/*var r = RegExp("\"abstract\"[\\s\\S]*?\"chapterUid\":" + chapterUid + "[\\s\\S]*?\"range\":\"[0-9]*?-","g")
			var marks = data.match(r)
			console.log("marks:" + marks)*/
		}
		/*thoughts = defaultdict(dict)
		for item in data['reviews']:
			#获取想法所在章节id
			chapterUid = item['review']['chapterUid']
			#获取原文内容
			abstract = item['review']['abstract']
			#获取想法
			text = item['review']['content']
			#获取想法开始位置
			text_positon = int(item['review']['range'].split('-')[0])
			#以位置为键，以标注为值添加到字典中,获得{chapterUid:{text_positon:"text分开想法和原文内容abstract"}}
			thoughts[chapterUid][text_positon] = text + '分开想法和原文内容' + abstract*/
	});
}

//监听来自inject.js、option的消息：是不是在BookPage、是的话bid是多少；如何设置变量
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	if(request.getBid == true){//信息为bid
		document.getElementById('bookId').value = request.bid;
		setuserVid();
		sendResponse('我是后台，我已收到你返回bid的消息：' + JSON.stringify(request));
	}else if(request.getContents == true){//信息为来自inject-content.js的目录信息
		console.log("接收到目录信息")
		var texts = request.contents;
		var res = '';
		//生成目录res
		for(var i = 0, len = texts.length; i < len; i++){
			var level = texts[i].charAt(0);
			var chapterInfo = texts[i].substr(1);
			if(level == "1"){
				res = res +  document.getElementById("level1").innerHTML + chapterInfo + "\n\n";
			}else if(level == "2"){
				res = res +  document.getElementById("level2").innerHTML + chapterInfo + "\n\n";
			}else if(level == "3"){
				res = res +  document.getElementById("level3").innerHTML + chapterInfo + "\n\n";
			}
		}
		//复制/设置目录res
		var copy = function(text){
			var inputText = document.getElementById("formatted_text");
			var copyBtn = document.getElementById("btn_copy");
			var clipboard = new Clipboard('.btn');
			clipboard.on('success', function (e) {
				console.log("复制成功" + JSON.stringify(e));
			});
			clipboard.on('error', function (e) {
				console.log("复制出错" + JSON.stringify(e));
				alert("复制出错" + JSON.stringify(e));
			});
			inputText.innerHTML = text;
			copyBtn.click();
		};
		if(document.getElementById("Bookcontents").innerHTML == "getBookContents"){//如果需要获取目录
			console.log("开始设置Bookcontents");
			document.getElementById("Bookcontents").innerHTML = res;
		}else{//如果不需要获取目录，直接复制
			console.log("准备复制目录");
			copy(res);
		}
		//设置当前目录
		document.getElementById("currentContent").innerHTML = request.currentContent
		sendResponse('我是后台，我已收到你返回contents的消息，消息有点长，就不详细回复了！');
	}else if(request.getSetting == true){//信息为option页面获取初始化信息
		console.log("接收到设置页初始化请求");
		sendResponse({
				s1Pre: document.getElementById("style1Pre").innerHTML, 
				s1Suf: document.getElementById("style1Suf").innerHTML, 
				s2Pre: document.getElementById("style2Pre").innerHTML, 
				s2Suf: document.getElementById("style2Suf").innerHTML, 
				s3Pre: document.getElementById("style3Pre").innerHTML, 
				s3Suf: document.getElementById("style3Suf").innerHTML, 
				lev1: document.getElementById("level1").innerHTML, 
				lev2: document.getElementById("level2").innerHTML, 
				lev3: document.getElementById("level3").innerHTML, 
				thouPre: document.getElementById("thoughtPre").innerHTML, 
				thouSuf: document.getElementById("thoughtSuf").innerHTML, 
				displayN: document.getElementById("displayNumber").innerHTML
				});
	}else if(request.set == true){//信息为option页面设置改变值
		console.log("接收到设置页改变信息");
		if(request.s1Pre != undefined){
			document.getElementById("style1Pre").innerHTML = request.s1Pre;
		}
		if(request.s1Suf != undefined){
			document.getElementById("style1Suf").innerHTML = request.s1Suf;
		}
		if(request.s2Pre != undefined){
			document.getElementById("style2Pre").innerHTML = request.s2Pre;
		}
		if(request.s2Suf != undefined){
			document.getElementById("style2Suf").innerHTML = request.s2Suf;
		}
		if(request.s3Pre != undefined){
			document.getElementById("style3Pre").innerHTML = request.s3Pre;
		}
		if(request.s3Suf != undefined){
			document.getElementById("style3Suf").innerHTML = request.s3Suf;
		}
		if(request.lev1 != undefined){
			document.getElementById("level1").innerHTML = request.lev1;
		}
		if(request.lev2 != undefined){
			document.getElementById("level2").innerHTML = request.lev2;
		}
		if(request.lev3 != undefined){
			document.getElementById("level3").innerHTML = request.lev3;
		}
		if(request.thouPre != undefined){
			document.getElementById("thoughtPre").innerHTML = request.thouPre;
		}
		if(request.thouSuf != undefined){
			document.getElementById("thoughtSuf").innerHTML = request.thouSuf;
		}
		if(request.displayN != undefined){
			if(document.getElementById("displayNumber").innerHTML == "true"){
				document.getElementById("displayNumber").innerHTML = "false";
			}else{
				document.getElementById("displayNumber").innerHTML = "true";
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
			//获取目录到background-page
			if(document.getElementById("Bookcontents").innerHTML != "getBookContents"){
				document.getElementById("Bookcontents").innerHTML = "getBookContents";
			}
			getBookContents();
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
			//获取目录到background-page
			if(document.getElementById("Bookcontents").innerHTML != "getBookContents"){
				document.getElementById("Bookcontents").innerHTML = "getBookContents";
			}
			getBookContents();
			chrome.tabs.executeScript(tab.id, {file: 'inject-bid.js'});
			//chrome.tabs.executeScript(tab.id, {file: 'inject-contents.js'});
			setuserVid();
			chrome.browserAction.setPopup({ popup: 'popup.html' });
			}
	}

});