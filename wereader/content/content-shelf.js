//console.log("content-shelf.js：被注入")
chrome.runtime.sendMessage({type: "getUserVid"})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.userVid != undefined && request.userVid != "null"){
		getData("https://i.weread.qq.com/shelf/sync?userVid=" + request.userVid + "&synckey=0&lectureSynckey=0",function(data){
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
			//将书架中未分类的书籍归为 "未分类书籍"
			shelf['未分类书籍'] = []
			for(var key in bookDic){
				shelf["未分类书籍"].push(bookDic[key])
			}
			//遍历分类给书本排序
			var colId = ""
			var rank = function(x,y){
				return (x[colId] > y[colId]) ? 1 : -1
			}
			colId = "readUpdateTime"
			for(var key in shelf){
				shelf[key].sort(rank)
				shelf[key].reverse()
			}
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
			div.style.cssText = "display: none;border-color: rgb(230, 230, 230) rgb(230, 230, 230) rgb(230, 230, 230) currentcolor;border-style: solid solid solid none;border-width: 1.5px 1.5px 1.5px medium;border-image: none 100% / 1 / 0 stretch;border-radius: 0px 4px 4px 0px;max-height: 595px;overflow: hidden auto;"
			//遍历类别
			for(var key in shelf){
				let categoryName = key
				let categoryElement = document.createElement('div')
				categoryElement.textContent = categoryName
				categoryElement.className = "category"
				categoryElement.style.cssText = "color: black;cursor: pointer;padding: 2px 8px;border-radius: 4px;margin: 2px;user-select: none;"
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
					bookLink.textContent = "○ " + categoryObjList[i].title
					let coverLink = categoryObjList[i].cover.split("/")[5]
					bookLink.href = booksDic[coverLink]
					if(booksDic[coverLink] != undefined){
						bookLink.className = "bookLink"
						bookLink.style.cssText = "width: 100%;height: 100%;margin: 2px;display: inline-table;border-radius: 4px;"
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
			hoverElement.textContent = "书架"
			hoverElement.style.cssText = "color: black;background-color: rgb(241, 245, 248);border-radius: 0px 4px 4px 0px;border-color: rgb(230, 230, 230) rgb(230, 230, 230) rgb(230, 230, 230) currentcolor;border-style: solid solid solid none;border-width: 1px 1px 1px medium;border-image: none 100% / 1 / 0 stretch;width: 14px;padding: 6px;display: block;"
			hoverElement.onmouseenter = function(){
				div.style.display = "block"
				hoverElement.style.display = "none"
			}
			parentElement.style.cssText = "background-color: rgb(241, 248, 255);font-size: 14px;line-height: 1.5;width: auto;min-height: 50px;max-width: 230px;max-height: 600px;left: 0px;top: 100px;position: fixed;border-radius: 0px 4px 4px 0px;"
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
	var httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', url, true);
	httpRequest.withCredentials = true;
	httpRequest.send();
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState==4 && httpRequest.status==200){
			var data = httpRequest.responseText;//获取到json字符串，还需解析
			callback(data);
		}
	};
}