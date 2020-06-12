//popup获取vid：OK
function getuserVid(){
	console.log("getuserVid()被调用")
	return document.getElementById("userVid").value;
}

//popup获取bid：OK
function getbookId(){
	console.log("getbookId()被调用")
	return document.getElementById('bookId').value;
}

//获取userVid并设置到背景页：OK
function setuserVid(){
	console.log("setuserVid()被调用")
	//获取当前页面
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		var url = tabs[0].url;
		console.log("setuserVid()中的chrome.tabs.query()获取到页面：" + url)
		var list = url.split("/")
		if(list[2] == "weread.qq.com" && list[3] == "web" && list[4] == "reader" && list[5] != ""){
			//获取当前页面的cookie然后设置bookId和userVid
			chrome.cookies.get({
				url: url,
				name: 'wr_vid'
			},function(cookie){
				if(cookie == null){
					console.log("setuserVid()获取cookie失败，请检查");
					document.getElementById('userVid').value = "null";
				}else{
					console.log("setuserVid()获取cookie成功")
					var userVid = cookie.value.toString();
					console.log("userVid为：" + userVid);
					document.getElementById('userVid').value = userVid;
				}
			});
		}
	});
}

//获取数据：OK
function getData(url,callback){
	console.log("getData(url,callback)被调用")
	var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
	httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
	httpRequest.withCredentials = true;
	httpRequest.send();//第三步：发送请求  将请求参数写在URL中
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		console.log("getData(url,callback)中的httpRequest.onreadystatechange触发")
		if (httpRequest.readyState==4 && httpRequest.status==200){
			console.log("getData(url,callback)中的httpRequest.onreadystatechange获取数据结束")
			var data = httpRequest.responseText;//获取到json字符串，还需解析
			callback(data);
		}
	};
}

//复制内容：OK
function copy(text){
	console.log("copy(text)被调用")
	var inputText = document.getElementById("formatted_text");
	var copyBtn = document.getElementById("btn_copy");
	var clipboard = new Clipboard('.btn');
	clipboard.on('success', function (e) {
		console.log("复制成功");
		/* chrome.tabs.query({active: true,currentWindow: true}, function(tab){
			console.log("copy(text)中的chrome.tabs.query()获取到页面，开始注入inject-toast.js")
			chrome.tabs.executeScript(tab[0].id, {file: 'inject-toast.js'});
			console.log("inject-toast.js注入结束")
		}) */
	});
	clipboard.on('error', function (e) {
		console.error("复制出错:\n" + JSON.stringify(e));
		alert("复制出错:\n" + JSON.stringify(e));
	});
	inputText.innerHTML = text;
	copyBtn.click();
}

//获取书评：OK
function getComment(url,bookId,isHtml){
	console.log("getComment(url,bookId,isHtml)被调用")
	getData(url,function(data){
		console.log("在getComment(url,bookId,isHtml)的调用下getData(url,callback)的回调函数被调用")
		var json = JSON.parse(data)
		var reviews = json.reviews
		var htmlContent = ""
		var content = ""
		var title = ""
		//遍历书评
		for(var i=0,len=reviews.length;i<len;i++){
			var bookid = reviews[i].review.bookId
			if(bookid == bookId.toString()){
				htmlContent = reviews[i].review.htmlContent
				content = reviews[i].review.content.replace("\n","\n\n")
				title = reviews[i].review.title
				break
			}else{
				continue
			}
		}
		if(htmlContent != "" || content != "" || title != ""){
			if(isHtml == true){
				if(title != ""){
					copy("# " + title + "\n\n" + htmlContent);
				}else{
					copy(htmlContent);
				}
			}else{
				if(title != ""){
					copy("### " + title + "\n\n" + content);
				}else{
					copy(content);
				}
			}
		}else{
			alert("该书无书评")
		}
	});
}

//获取目录：OK
function getBookContents(){
	console.log("getBookContents()被调用")
	chrome.tabs.query({active:true,currentWindow:true}, function(tab){
		console.log("getBookContents()调用下的chrome.tabs.query()的回调函数被调用，开始注入inject-contents.js")
		chrome.tabs.executeScript(tab[0].id, {file: 'inject-contents.js'});
		console.log("inject-contents.js注入结束")
	})
}

//获取标注：OK
function getBookMarks(url,callback){
	console.log("getBookMarks(url,callback)被调用")
	getData(url,function(data){
		console.log("getBookMarks(url,callback)调用下getData()的回调函数被调用")
		var json = JSON.parse(data)
		//获取章节并排序
		var chapters = json.chapters
		var colId = "chapterUid";
		//排序函数
		var rank = function(x,y){
			return (x[colId] > y[colId]) ? 1 : -1
		}
		chapters.sort(rank);
		//获取标注
		//遍历章节
		for(var i=0,len1=chapters.length;i<len1;i++){
			var chapterUid = chapters[i].chapterUid.toString()
			var updated = json.updated
			var marksInAChapter = []
			//遍历标注获得章内标注
			for(var j=0,len2=updated.length;j<len2;j++){
				if(updated[j].chapterUid.toString() == chapterUid){
					updated[j].range = parseInt(updated[j].range.replace("-[0-9]*?\"","").replace("\"",""))
					marksInAChapter.push(updated[j])
				}
			}
			//排序章内标注并加入到章节内
			var colId = "range"
			marksInAChapter.sort(rank)
			chapters[i].marks = marksInAChapter
		}
		callback(chapters)
	});
}

//处理数据，复制标注：OK
function copyBookMarks(url,isAll){
	console.log("copyBookMarks(url,isAll)被调用")
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=","")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0",function(chaptersData){
		console.log("copyBookMarks(url,isAll)调用了getData(url,callback)并进入了getData(url,callback)的回调函数")
		getBookMarks(url,function(chaptersAndMarks){
			console.log("getData(url,callback)的回调函数调用了getBookMarks(url,callback)并进入了getBookMarks(url,callback)的回调函数")
			var json = JSON.parse(chaptersData)
			var contentData = json.data[0].updated
			var contents = []
			//获取contents——————[{"title":"封面","chapterUid":1,"level":1},...]
			for(var i=0,len=contentData.length;i<len;i++){
				contents.push({title:contentData[i].title,chapterUid:contentData[i].chapterUid,level:parseInt(contentData[i].level)})
			}
			//得到res
			res = ""
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
			var getTitleAddedPre = function(title,level){
				if(level == 1){
					return document.getElementById("level1").innerHTML + title
				}else if(level == 2){
					return document.getElementById("level2").innerHTML + title
				}else if(level == 3){
					return document.getElementById("level3").innerHTML + title
				}
			}
			if(isAll == true){
				console.log("isAll == true")
				for(var i=0,len1=chaptersAndMarks.length;i<len1;i++){
					var chapterUid = chaptersAndMarks[i].chapterUid
					for(var j=0,len2=contents.length;j<len2;j++){
						if(chapterUid == contents[j].chapterUid){
							res += getTitleAddedPre(contents[j].title,contents[j].level) + "\n\n"
							//遍历章内标注
							for(var k=0,len3=chaptersAndMarks[i].marks.length;k<len3;k++){
								var markText = chaptersAndMarks[i].marks[k].markText
								var style = chaptersAndMarks[i].marks[k].style
								res += getMarkPre(style) + markText + getMarkSuf(style) + "\n\n"
							}
						}
					}
				}
			}else{
				//遍历目录
				console.log("isAll == false")
				for(var j=0,len2=contents.length;j<len2;j++){
					if(contents[j].title == document.getElementById("currentContent").innerHTML.substring(1)){
						console.log("找到目标章节")
						res += getTitleAddedPre(contents[j].title,contents[j].level) + "\n\n"
						var chapterUid = contents[j].chapterUid
						//遍历标注
						for(var i=0,len1=chaptersAndMarks.length;i<len1;i++){
							if(chaptersAndMarks[i].chapterUid == chapterUid){
								//遍历章内标注
								for(var k=0,len3=chaptersAndMarks[i].marks.length;k<len3;k++){
									res += chaptersAndMarks[i].marks[k].markText + "\n\n"
								}
								break
							}
						}
						break
					}
				}
			}
			copy(res)
		})
	})
}

//获取热门标注：OK
function getBestBookMarks(url,callback){
	console.log("getBestBookMarks(url,callback)被调用")
	getData(url,function(data){
		console.log("getBestBookMarks(url,callback)调用了getData(url,callback)并进入了getData(url,callback)的回调函数")
		var json = JSON.parse(data)
		var chapters = json.chapters
		//查找每章节热门标注
		var bestMarks = {}
		//遍历章节
		for(var i=0,len1=chapters.length;i<len1;i++){
			var chapterUid = chapters[i].chapterUid
			var bestMarksInAChapter = []
			//遍历所有热门标注
			for(var j=0,len2=json.items.length;j<len2;j++){
				if(json.items[j].chapterUid == chapterUid){
					var markText = json.items[j].markText
					var totalCount = json.items[j].totalCount
					var range = json.items[j].range.replace(/-[0-9]*?"/,"").replace("\"","")
					bestMarksInAChapter.push({markText:markText,totalCount:totalCount,range:parseInt(range)})
				}
			}
			var colId = "range"
			var rank = function(x,y){
				return (x[colId] > y[colId]) ? 1 : -1
			}
			bestMarksInAChapter.sort(rank)
			bestMarks[chapterUid.toString()] = bestMarksInAChapter
		}
		callback(bestMarks)
	})
}

//处理数据，复制热门标注：OK
function copyBestBookMarks(url){
	console.log("copyBestBookMarks(url)被调用了")
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=","")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0",function(data){
		console.log("copyBestBookMarks(url)调用了getData()并进入了getData()的回调函数")
		getBestBookMarks(url,function(bestMarks){
			console.log("copyBestBookMarks(url)中getData()调用了getBestBookMarks(url,callback)并进入了getBestBookMarks(url,callback)的回调函数")
			var json = JSON.parse(data)
			var contentData = json.data[0].updated
			var contents = []
			//获取contents——————[{"title":"封面","chapterUid":1,"level":1},...]
			for(var i=0,len=contentData.length;i<len;i++){
				contents.push({title:contentData[i].title,chapterUid:contentData[i].chapterUid,level:parseInt(contentData[i].level)})
			}
			//得到res
			res = ""
			//遍历bestMark
			for(var key in bestMarks){
				//遍历章节
				for(var i=0,len1=contents.length;i<len1;i++){
					//如果找到某章热门标注对应章节
					if(key == contents[i].chapterUid){
						var title =  ""
						if(contents[i].level == 1){
							title = document.getElementById("level1").innerHTML + contents[i].title
						}else if(contents[i].level == 2){
							title = document.getElementById("level2").innerHTML + contents[i].title
						}else if(contents[i].level == 3){
							title = document.getElementById("level3").innerHTML + contents[i].title
						}
						res += title + "\n\n"
						//遍历章内标注
						for(var j=0,len2=bestMarks[key].length;j<len2;j++){
							res += bestMarks[key][j].markText + "  <u>" + bestMarks[key][j].totalCount + "</u>" + "\n\n"
						}
					}
				}
			}
			copy(res)
		})
	})
}

//获取想法：OK
function getMyThought(url,callback){
	console.log("getMyThought(url,callback)被调用")
	getData(url,function(data){
		console.log("getMyThought(url,callback)调用了getData()并进入了getData()的回调函数")
		var json = JSON.parse(data)
		//获取章节并排序
		var chapterList = Array.from(new Set(data.match(/"chapterUid":[0-9]*/g)))
		var colId = "chapterUid";
		var rank = function(x,y){
			return (x[colId] > y[colId]) ? 1 : -1
		}
		chapterList.sort(rank)
		//查找每章节标注并总结好
		var thoughts = {}
		//遍历章节
		for(var i=0,len1=chapterList.length;i<len1;i++){
			var index = chapterList[i].indexOf(":")
			var chapterUid = chapterList[i].substring(index+1)
			var thoughtsInAChapter = []
			//遍历所有标注
			for(var j=0,len2=json.reviews.length;j<len2;j++){
				//处理有书评的情况
				if(json.reviews[j].review.chapterUid == undefined){
					continue
				}
				if(json.reviews[j].review.chapterUid.toString() == chapterUid){
					var abstract = json.reviews[j].review.abstract
					var content = json.reviews[j].review.content
					var range = json.reviews[j].review.range.replace(/-[0-9]*?"/,"").replace("\"","")
					thoughtsInAChapter.push({abstract:abstract,content:content,range:parseInt(range)})
				}
			}
			var colId = "range"
			thoughtsInAChapter.sort(rank)
			thoughts[chapterUid] = thoughtsInAChapter
		}
		callback(thoughts)
	});
}

//处理数据，复制想法：OK
function copyThought(url){
	console.log("copyThought(url)被调用")
	var bookId = url.match(/bookId=[0-9]*/)[0].replace("bookId=","")
	getData("https://i.weread.qq.com/book/chapterInfos?" + "bookIds=" + bookId + "&synckeys=0",function(data){
		console.log("copyThought(url)调用了getData()并进入了它的回调函数")
		getMyThought(url,function(thoughts){
			console.log("copyThought(url)下的getData()的回调函数调用了getMyThought()并进入了它的回调函数")
			var json = JSON.parse(data)
			var contentData = json.data[0].updated
			var contents = []
			//获取contents——————[{"title":"封面","chapterUid":1,"level":1},...]
			for(var i=0,len=contentData.length;i<len;i++){
				contents.push({title:contentData[i].title,chapterUid:contentData[i].chapterUid,level:parseInt(contentData[i].level)})
			}
			//得到res
			res = ""
			//遍历thoughts
			for(var key in thoughts){
				//遍历章节
				for(var i=0,len1=contents.length;i<len1;i++){
					//如果找到某章想法对应章节
					if(key == contents[i].chapterUid){
						var title =  ""
						if(contents[i].level == 1){
							title = document.getElementById("level1").innerHTML + contents[i].title
						}else if(contents[i].level == 2){
							title = document.getElementById("level2").innerHTML + contents[i].title
						}else if(contents[i].level == 3){
							title = document.getElementById("level3").innerHTML + contents[i].title
						}
						res += title + "\n\n"
						//遍历章内想法
						for(var j=0,len2=thoughts[key].length;j<len2;j++){
							res += thoughts[key][j].abstract + "\n\n"
							res += document.getElementById("thoughtPre").innerHTML + thoughts[key][j].content + document.getElementById("thoughtSuf").innerHTML + "\n\n"
						}
					}
				}
			}
			copy(res)
		})
	})
}

//监听来自inject.js、option的消息：是不是在BookPage、是的话bid是多少；如何设置变量
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	console.log("chrome.runtime.onMessage.addListener()监听到消息")
	console.log("request:\n" + JSON.stringify(request))
	if(request.getBid == true){//信息为bid
		console.log("request.getBid == true，接收到bid信息")
		document.getElementById('bookId').value = request.bid;
		setuserVid();
		sendResponse('我是后台，我已收到你返回bid的消息：' + JSON.stringify(request));
	}else if(request.getContents == true){//信息为来自inject-content.js的目录信息
		console.log("request.getContents == true，接收到目录信息")
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
		console.log("request.getSetting == true，接收到设置页初始化请求");
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
		console.log("request.set == true，接收到设置页改变信息");
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
	console.log("chrome.tabs.onActivated.addListener()监听到消息")
	chrome.tabs.get(moveInfo.tabId,function(tab){
		console.log("chrome.tabs.get()获取到页面信息，并进入了它的回调函数")
		var currentUrl = tab.url;
		console.log("当前页面：" + currentUrl)
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
			//注入脚本获取全部目录数据和当前目录
			getBookContents();
			chrome.tabs.executeScript(tab.id, {file: 'inject-bid.js'});
			//chrome.tabs.executeScript(tab.id, {file: 'inject-contents.js'});
			chrome.browserAction.setPopup({ popup: 'popup.html' });
			setuserVid();
		}
	});
});

//页面监控：是否发生更新
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("chrome.tabs.onUpdated.addListener()监听到消息")
	if(changeInfo.status == "loading"){
		console.log("changeInfo.status == \"loading\"")
		var loadingUrl = tab.url;
		console.log("当前页面：" + loadingUrl)
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
			//
			if(document.getElementById("Bookcontents").innerHTML != "getBookContents"){
				document.getElementById("Bookcontents").innerHTML = "getBookContents";
			}
			//注入脚本获取全部目录数据和当前目录
			getBookContents();
			chrome.tabs.executeScript(tab.id, {file: 'inject-bid.js'});
			//chrome.tabs.executeScript(tab.id, {file: 'inject-contents.js'});
			setuserVid();
			chrome.browserAction.setPopup({ popup: 'popup.html' });
			}
	}

});