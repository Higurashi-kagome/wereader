/* 用于生成书架目录 */

//console.log("content-shelf.js：被注入")
chrome.runtime.sendMessage({type: "getShelf"})
chrome.runtime.onMessage.addListener(function(data){
		var booksData = JSON.parse(data).books
		var categoryData = JSON.parse(data).archive
		var bookId_bookObj = {}
		var shelf = {}
		//bookDic = {'bookId':bookObj}
		for(let i=0,len=booksData.length;i<len;i++){
			bookId_bookObj[booksData[i].bookId] = booksData[i]
		}
		//得到 shelf = {'类别1': [bookObj1,bookObj2,...], '类别2': [bookObj1,bookObj2,...]}
		for(let j=categoryData.length-1;j>=0;j--){
			let categoryName = categoryData[j].name
			let allBookId = categoryData[j].bookIds
			shelf[categoryName] = []
			//遍历某类别内的书本id
			for(let k=0,len2=allBookId.length;k<len2;k++){
				let id = allBookId[k]
				let bookObj = bookId_bookObj[id]
				shelf[categoryName].push(bookObj)
				delete bookId_bookObj[id]
			}
		}
		//将书架中未分类的书籍归为 "未分类书籍"
		shelf["未分类书籍"] = []
		for(let key in bookId_bookObj){
			shelf["未分类书籍"].push(bookId_bookObj[key])
		}
		const updateTime = "readUpdateTime"
		var rank = function(x,y){
			return (x[updateTime] > y[updateTime]) ? -1 : 1
		}
		//遍历分类给书本按readUpdateTime排序并初始化categorySorter方便给分类排序
		var categorySorter = []
		for(let categoryName in shelf){
			shelf[categoryName].sort(rank)
			//初始化categorySorter
			let categoryNameAndUpdateTime = {}
			if(shelf[categoryName].length == 0)continue
			categoryNameAndUpdateTime[updateTime] = shelf[categoryName][0][updateTime]
			categoryNameAndUpdateTime["categoryName"] = categoryName
			categorySorter.push(categoryNameAndUpdateTime)
		}
		categorySorter.sort(rank)
		//获取创建目录所需书本url
		var booksDic = {}
		var booksElement = document.getElementsByClassName("shelf_list")[0].childNodes
		for(let i=0,len=booksElement.length;i<len-1;i++){
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
		//遍历categorySorter
		for(let i=0,len1=categorySorter.length;i<len1;i++){
			let key = categorySorter[i]["categoryName"]
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
			for(let j=0,len2=categoryObjList.length;j<len2;j++){
				let bookLink = document.createElement('a')
				bookLink.textContent = categoryObjList[j].title
				let coverLink = categoryObjList[j].cover.split("/")[5]
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