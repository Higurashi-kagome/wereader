/* 用于生成书架目录 */

//console.log("content-shelf.js：被注入")
chrome.runtime.sendMessage({type: "getShelf"})
chrome.runtime.onMessage.addListener(function(data){
		var books = JSON.parse(data).books
		var archive = JSON.parse(data).archive
		var bookDic = {}
		var shelf = {}
		//bookDic = {'bookId':bookObj}
		for(var i=0,len=books.length;i<len;i++){
			bookDic[books[i].bookId] = books[i]
		}
		//得到 shelf = {'类别1': [bookObj1,bookObj2,...], '类别2': [bookObj1,bookObj2,...]}
		for(var j=archive.length-1;j>=0;j--){
			let archiveName = archive[j].name
			let bookIdsObj = archive[j].bookIds
			shelf[archiveName] = []
			//遍历某类别内的书本id
			for(var k=0,len2=bookIdsObj.length;k<len2;k++){
				let id = bookIdsObj[k]
				let bookObj = bookDic[id]
				shelf[archiveName].push(bookObj)
				delete bookDic[id]
			}
		}
		//将书架中未分类的书籍归为 "未分类书籍"
		shelf["未分类书籍"] = []
		for(var key in bookDic){
			shelf["未分类书籍"].push(bookDic[key])
		}
		//遍历分类给书本按readUpdateTime排序
		for(var key in shelf){
			shelf[key].sort(function(x,y){
				const colId = "readUpdateTime"
				return (x[colId] > y[colId]) ? 1 : -1
			})
			shelf[key].reverse()
		}
		//获取创建目录所需书本url
		var booksDic = {}
		var booksElement = document.getElementsByClassName("shelf_list")[0].childNodes
		for(var i=0,len=booksElement.length;i<len-1;i++){
			let child = booksElement[i].childNodes[0]
			if(child && child.getElementsByClassName("wr_bookCover_img")[0]){
				let coverSrc = child.getElementsByClassName("wr_bookCover_img")[0].src.split("/")[5]
				let bookSrc = booksElement[i].href
				booksDic[coverSrc] = bookSrc
			}
		}
		/*创建目录*/
		//目录部分
		var shelfElement = document.createElement("div")
		shelfElement.id = "shelfDIV"
		//遍历类别
		for(var key in shelf){
			let categoryElement = document.createElement('ol')//书架类别
			categoryElement.textContent = key
			categoryElement.className = "category"
			categoryElement.onmouseenter = function () {
				//设置其背景颜色
				this.style.backgroundColor = "rgb(227,227,227)"
			}
			categoryElement.onmouseleave = function () {
				//恢复到这个标签默认的颜色
				this.style.backgroundColor = ""
			}
			let categoryObjList = shelf[key]
			if(categoryObjList.length == 0)continue
			//遍历书本
			let booksContainer = document.createElement("ul")//章内书本容器
			booksContainer.style.display = "none"
			booksContainer.style.marginLeft = "15px"
			for(var i=0,len=categoryObjList.length;i<len;i++){
				let bookLink = document.createElement('a')
				bookLink.textContent = categoryObjList[i].title
				let coverLink = categoryObjList[i].cover.split("/")[5]
				bookLink.href = booksDic[coverLink]
				if(booksDic[coverLink]){
					bookLink.className = "bookLink"
					bookLink.onmouseenter = function () {
						//设置其背景颜色
						this.style.backgroundColor = "rgb(227,227,227)"
					}
					bookLink.onmouseleave = function () {
						//恢复到这个标签默认的颜色
						this.style.backgroundColor = ""
					}
					let li = document.createElement("li")
					li.appendChild(bookLink)
					booksContainer.appendChild(li)
				}
			}
			categoryElement.addEventListener("click",function(){
				booksContainer.style.display = (booksContainer.style.display == "none") ? "block" : "none"
			})
			shelfElement.appendChild(categoryElement)
			shelfElement.appendChild(booksContainer)
		}
		//父容器
		var parentElement = document.createElement("div")
		parentElement.id = "parentElement"
		//侧边部分
		var hoverElement = document.createElement("div")
		hoverElement.id = "hoverElement"
		hoverElement.textContent = "书架"
		var count = 1
		//目录部分和侧边部分嵌入到父容器中
		parentElement.appendChild(shelfElement)
		parentElement.appendChild(hoverElement)
		document.body.appendChild(parentElement)
		hoverElement.onclick = function(){
			if (count == 1){
				parentElement.style.left = "-200px"
			}else{
				parentElement.style.left = "6px"
			}
		  	count = count*(-1)
		}
});