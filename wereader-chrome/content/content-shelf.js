/* 用于生成书架目录 */

//console.log("content-shelf.js：被注入");
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
function getShelf(data){
	let {books, archive: categoryObjs} = data;
	// {bookId:bookObj}
	var bookId_book = books.reduce((tempMap, curBook)=>{
		tempMap[curBook.bookId] = curBook;
		return tempMap;
	},{});
	// [{cateName: '', books: []}]
	let shelf = categoryObjs.reduce((tempShelf, curCate)=>{
		let cate = {};
		cate.cateName = curCate.name;
		cate.books = [];
		curCate.bookIds.forEach(bookId=>{
			cate.books.push(bookId_book[bookId]);
			delete bookId_book[bookId];
		});
		tempShelf.push(cate);
		return tempShelf;
	},[]);
	//将书架中未分类的书籍归为 "未分类书籍"
	let extraCate = {cateName: '未分类', books: []};
	for(let bookId in bookId_book){
		extraCate.books.push(bookId_book[bookId]);
	}
	if(extraCate.books.length) shelf.push(extraCate);
	// 书本排序
	shelf.forEach(cate=>{
		cate.books.sort((x,y)=>{
			return (x.readUpdateTime > y.readUpdateTime) ? -1 : 1;
		});
	});
	// 分类排序
	shelf.sort((x,y)=>{
		try { // 分类为空时会报错
			return (x.books[0].readUpdateTime > y.books[0].readUpdateTime) ? -1 : 1;
		} catch (error) {}
	});
	return shelf;
}

function createShelf(shelf){
	// https://weread-1258476243.file.myqcloud.com/app/assets/bookcover/book_cover_default_imported_06.png
	const matchId = /([\d]{1,})(?=\/[a-z_\d]*\.jpg)|(?<=wrepub\/)([\w_]*)|(?<=mmhead\/)([\w]*)|((?<=\/)[^\/\.]*(?=\.png))/g;
	//获取创建目录所需书本 url
	let bookId_href = {};
	document.querySelectorAll(".wr_bookCover_img").forEach(coverEl=>{
		let bookId = coverEl.src.match(matchId)[0];
		bookId_href[bookId] = coverEl.parentElement.parentElement.href;
	});
	/*创建目录*/
	let shelfEl = document.createElement("div");
	shelfEl.id = "shelf";
	for (const cate of shelf) {
		let {cateName, books} = cate;
		// 某一分类元素
		let cateEl = document.createElement('ol'); 
		setAttributes(cateEl,{textContent:cateName,className:"category"});
		shelfEl.appendChild(cateEl);
		// 遍历某一分类下的书本
		if(!books.length) continue;
		let booksContainer = document.createElement("ul");//章内书本容器
		setAttributes(booksContainer,{style:{display:"none",marginLeft:"15px"}});
		for (const book of books) {
			let bookId = undefined;
			try {
				bookId = book.cover.match(matchId)[0];
			} catch (error) {
				console.log(error);
				continue;
			}
			if(!bookId_href[bookId]) continue;// 某些内容（比如公众号）在 books_bookId_href 中不存在数据
			let bookLinkEl = document.createElement('a');
			const attributes = {target:"_blanck",className:"bookLinkEl",
			textContent:book.title,href:bookId_href[bookId]}
			setAttributes(bookLinkEl, attributes);
			let bookLiEl = document.createElement("li");
			bookLiEl.appendChild(bookLinkEl);
			booksContainer.appendChild(bookLiEl);
		}
		shelfEl.appendChild(booksContainer);
		cateEl.onclick = ()=>{
			if(window.getComputedStyle(booksContainer).display == 'none'){
				booksContainer.style.display = 'block';
			}else{
				booksContainer.style.display = 'none';
			}
		}
	}
	// 侧边按钮
	let hoverEl = document.createElement("div");
	setAttributes(hoverEl,{id:"hoverEl",textContent:"书架"});
	hoverEl.onclick = ()=>{
		if(window.getComputedStyle(parentEl).left == '6px'){
			parentEl.style.left = '-200px';
		}else{
			parentEl.style.left = '6px';
		}
	}
	// 包容侧边按钮及书架内容的父容器
	let parentEl = document.createElement("div");
	parentEl.id = "parentEl";
	//目录部分和侧边部分嵌入到父容器中
	parentEl.appendChild(shelfEl);
	parentEl.appendChild(hoverEl);
	document.body.appendChild(parentEl);
}

chrome.runtime.sendMessage({type: "getShelf"});
chrome.runtime.onMessage.addListener(function(data){
	const shelf = getShelf(data);
	createShelf(shelf);
});