/* 用于生成书架目录 */

//console.log("content-shelf.js：被注入")
chrome.runtime.sendMessage({type: "getShelf"})
//设置属性
function setAttributes(element,attributes){
	for(let key in attributes){
		if(Object.prototype.toString.call(attributes[key]) === '[object Object]'){
			setAttributes(element[key],attributes[key])
		}else{
			element[key] = attributes[key]
		}
	}
}
//处理书架数据
function getShelfData(data){
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
	let shelfData = {}
	shelfData.categorySorter = categorySorter
	shelfData.shelf = shelf
	return shelfData
}

chrome.runtime.onMessage.addListener(function(data){
		let shelfData = getShelfData(data)
		let shelf = shelfData.shelf
		let categorySorter = shelfData.categorySorter
		//获取创建目录所需书本url
		let books_bookId_href = {}
		let booksElement = document.getElementsByClassName("shelf_list")[0].childNodes
		for(let i=0,len=booksElement.length;i<len-1;i++){
			let child = booksElement[i].childNodes[0]
			if(child && child.getElementsByClassName("wr_bookCover_img")[0]){
				let splitedCover = child.getElementsByClassName("wr_bookCover_img")[0].src.split("/")
				let bookId = splitedCover[5] ? splitedCover[5] : splitedCover[4]//如果是导入书籍，则选择索引4的值作为标识
				books_bookId_href[bookId] = booksElement[i].href
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
			setAttributes(booksContainer,{style:{display:"none",marginLeft:"15px"}})
			//booksContainer.style.display = "none"
			//booksContainer.style.marginLeft = "15px"
			for(let j=0,len2=categoryObjList.length;j<len2;j++){
				let splitedCover = categoryObjList[j].cover.split("/")
				let bookId = splitedCover[5] ? splitedCover[5] : splitedCover[4]
				if(books_bookId_href[bookId]){
					let bookLink = document.createElement('a')
					let attributes = {target:"_blanck",className:"bookLink"}
					attributes.textContent = categoryObjList[j].title
					attributes.href = books_bookId_href[bookId]
					setAttributes(bookLink,attributes)
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
		//侧边部分
		var hoverElement = document.createElement("div")
		setAttributes(hoverElement,{id:"hoverElement",textContent:"书架"})
		var count = 1
		hoverElement.onclick = function(){
			parentElement.style.left = (count == 1) ? "-200px" : "6px"
		  	count = count*(-1)
		}
		//父容器
		var parentElement = document.createElement("div")
		parentElement.id = "parentElement"
		//目录部分和侧边部分嵌入到父容器中
		parentElement.appendChild(shelfElement)
		parentElement.appendChild(hoverElement)
		document.body.appendChild(parentElement)
});