console.log("content-shelf.js：被注入")
chrome.runtime.sendMessage({getUserVid: true})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.userVid != undefined && request.userVid != "null"){
		getData("https://i.weread.qq.com/shelf/sync?userVid=" + request.userVid + "&synckey=0&lectureSynckey=0",function(data){
			//console.log(data)
			var json = JSON.parse(data)
			var books = json.books
			var archive = json.archive
			var bookDic = {}
			var shelf = {}
			//{'bookId':bookObj}
			for(var i=0,len=books.length;i<len;i++){
				let id = books[i].bookId
				bookDic[id] = books[i]
			}
			//遍历书本分类{'类别1': [bookObj1,bookObj2,...], '类别2': [bookObj1,bookObj2,...]}
			for(var j=archive.length-1;j>=0;j--){
				let archiveName = archive[j].name
				let bookIdsObj = archive[j].bookIds
				shelf[archiveName] = []
				//遍历某类别内的书本id并追加{'readUpdatetime':time,'bookId':bookId,title:text}
				for(var k=0,len2=bookIdsObj.length;k<len2;k++){
					let id = bookIdsObj[k]
					let bookObj = bookDic[id]
					shelf[archiveName].push(bookObj)
					delete bookDic[id]
				}
			}
			//console.log(bookDic)
			shelf['未分类书籍'] = []
			for(var key in bookDic){
				shelf["未分类书籍"].push(bookDic[key])
			}
			var colId = ""
			var rank = function(x,y){
				return (x[colId] > y[colId]) ? 1 : -1
			}
			colId = "readUpdateTime"
			//遍历分类给书本排序
			for(var key in shelf){
				shelf[key].sort(rank)
				shelf[key].reverse()
			}
			//console.log(JSON.stringify(shelf))
			//获取创建目录所需书本url
			var booksDic = {}
			var books = document.getElementsByClassName("shelf_list")[0].childNodes
			for(var i=0,len=books.length;i<len-1;i++){
				let child = books[i].childNodes[0]
				if(child != undefined && child.getElementsByClassName("wr_bookCover_img")[0] != undefined){
					let coverSrc = child.getElementsByClassName("wr_bookCover_img")[0].src.split("/")[5]
					let bookSrc = books[i].href
					booksDic[coverSrc] = bookSrc
				}
			}
			/*创建目录*/
			//目录部分
			var div = document.createElement("div")
			div.id = "addedShelf"
			div.style.display = "none"
			div.style.border = "1.5px solid #e6e6e6"
			div.style.borderLeft = "none"
			div.style.borderRadius = "0px 4px 4px 0px"
			div.style.maxHeight = "595px"
			div.style.overflowY = "auto"
			div.style.overflowX = "hidden"
			//遍历类别
			for(var key in shelf){
				let categoryName = key
				let categoryElement = document.createElement('div')
				categoryElement.innerHTML = categoryName
				categoryElement.className = "category"
				categoryElement.style.color = "black"
				categoryElement.style.cursor = "pointer"
				categoryElement.style.padding = "2px 8px"
				categoryElement.style.borderRadius = "4px"
				categoryElement.style.margin = "2px"
				//双击不选中文字
				categoryElement.style.userSelect = "none"
				categoryElement.onmouseenter = function () {
					//设置其背景颜色
					this.style.backgroundColor = "rgb(227,227,227)"
				}
				categoryElement.onmouseleave = function () {
					//恢复到这个标签默认的颜色
					this.style.backgroundColor = ""
				}
				let categoryObjList = shelf[key]
				if(categoryObjList.length == 0){
					continue
				}
				//遍历书本
				let booksContainer = document.createElement("div")
				booksContainer.style.display = "none"
				booksContainer.style.marginLeft = "15px"
				for(var i=0,len=categoryObjList.length;i<len;i++){
					let bookLink = document.createElement('a')
					bookLink.innerHTML = "○ " + categoryObjList[i].title
					let coverLink = categoryObjList[i].cover.split("/")[5]
					bookLink.href = booksDic[coverLink]
					bookLink.style.width = "100%"
					bookLink.style.height = "100%"
					bookLink.style.margin = "2px"
					bookLink.style.display = "inline-table"
					if(booksDic[coverLink] != undefined){
						bookLink.className = "bookLink"
						bookLink.style.margin = "2px"
						bookLink.style.borderRadius = "4px"
						bookLink.onmouseenter = function () {
							//设置其背景颜色
							this.style.backgroundColor = "rgb(227,227,227)"
						}
						bookLink.onmouseleave = function () {
							//恢复到这个标签默认的颜色
							this.style.backgroundColor = ""
						}
						booksContainer.appendChild(bookLink)
					}
				}
				categoryElement.addEventListener("click",function(){
					if(booksContainer.style.display == "none"){
						booksContainer.style.display = "block"
					}else{
						booksContainer.style.display = "none"
					}
				})
				div.appendChild(categoryElement)
				div.appendChild(booksContainer)
			}
			//父容器
			var parentElement = document.createElement("div")
			parentElement.id = "parentElement"
			//侧边部分
			var hoverElement = document.createElement("div")
			hoverElement.id = "hoverElement"
			hoverElement.innerHTML = "书架"
			hoverElement.style.color = "black"
			hoverElement.style.backgroundColor = "#f1f5f8"
			hoverElement.style.borderRadius = "0px 4px 4px 0px"
			hoverElement.style.border = "1px solid #e6e6e6"
			hoverElement.style.borderLeft = "none"
			hoverElement.style.width = "14px"
			hoverElement.style.padding = "6px"
			hoverElement.onmouseenter = function(){
				div.style.display = "block"
				hoverElement.style.display = "none"
			}
			parentElement.style.backgroundColor = "#f1f8ff"
			parentElement.style.fontSize = "14px"
			parentElement.style.lineHeight = "1.5"
			parentElement.style.width = "auto"
			parentElement.style.minHeight = "50px"
			parentElement.style.maxWidth = "230px"
			parentElement.style.maxHeight = "600px"
			parentElement.style.left = "0px"
			parentElement.style.top = "100px"
			parentElement.style.position = "fixed"
			parentElement.style.borderRadius = "0px 4px 4px 0px"
			//目录部分和侧边部分嵌入到父容器中
			parentElement.appendChild(div)
			parentElement.appendChild(hoverElement)
			parentElement.onmouseleave = function(){
				div.style.display = "none"
				hoverElement.style.display = "block"
			}
			document.body.appendChild(parentElement)
		})
	}else{
		console.log("Err：request.userVid：" + request.userVid)
	}
});

//请求数据
function getData(url,callback){
	console.log("getData(url,callback)：被调用")
	var httpRequest = new XMLHttpRequest();//第一步：建立所需的对象
	httpRequest.open('GET', url, true);//第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
	httpRequest.withCredentials = true;
	httpRequest.send();//第三步：发送请求  将请求参数写在URL中
	/**
	 * 获取数据后的处理程序
	 */
	httpRequest.onreadystatechange = function () {
		console.log("getData(url,callback)：httpRequest.onreadystatechange触发")
		if (httpRequest.readyState==4 && httpRequest.status==200){
			console.log("getData(url,callback)：httpRequest.onreadystatechange获取数据结束")
			var data = httpRequest.responseText;//获取到json字符串，还需解析
			callback(data);
		}
	};
}