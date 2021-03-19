/* 初始化书架面板，先尝试从背景页获取数据，获取失败则直接调用背景页函数请求数据，最后初始化书架内容 */

document.getElementById('shelfBtn').addEventListener('click', async ()=>{
	let shelfData, shelfHtml;
	const shelfForPopup = bg.getShelfForPopup();
	if(shelfForPopup){
		shelfData = shelfForPopup.shelfData;
		shelfHtml = shelfForPopup.shelfHtml;
	}
	if(!shelfData || !shelfHtml){
		const shelfDataResp = await bg.getShelfData();
		if(shelfDataResp.errMsg){
			bg.alert('获取书架出错，请先登陆');
			return console.log(shelfDataResp);
		} else {
			shelfData = shelfDataResp;
		}
		shelfHtml = await bg.getShelfHtml();
	}

	const shelf = getShelf(shelfData);
	createShelf(shelf, shelfHtml);
	bg.setShelfForPopup(shelfData, shelfHtml);
});

function getShelf(shelfData){
	let {books, archive: categoryObjs} = shelfData;
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
	let extraCate = {cateName: '未分类书籍', books: []};
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

function createShelf(shelf, htmlText){
	let hrefs = htmlText.match(/(?<=href="\/web\/reader\/)([^"]*)/g);
	const matchId = /([\d]{1,})(?=\/[a-z_\d]*\.jpg)|(?<=wrepub\/)([\w_]*)|(?<=mmhead\/)([\w]*)/g;
	let bookIds = htmlText.match(matchId);
	if(hrefs.length!==bookIds.length) return console.error('Length equal issue.');
    let shelfContainer = document.getElementById('shelf');
	shelfContainer.innerHTML = '';
	//获取创建目录所需书本 url
	let bookId_href = {};
	for (let i = 0; i < bookIds.length; i++) {
		bookId_href[bookIds[i]] = `https://weread.qq.com/web/reader/${hrefs[i]}`;
	}
	/*创建目录*/
	for (const cate of shelf) {
		let {cateName, books} = cate;
		// 某一分类元素
		let cateEl = document.createElement('button'); 
		setAttributes(cateEl,{textContent:cateName,className:"dropdown-btn"});
		shelfContainer.appendChild(cateEl);
		// 遍历某一分类下的书本
		if(!books.length) continue;
		let booksContainer = document.createElement("div");//章内书本容器
		setAttributes(booksContainer,{className:'dropdown-container'});
		for (const book of books) {
			let bookId = undefined;
			try {
				bookId = book.cover.match(matchId)[0];
			} catch (error) {
				console.warn(error);
				continue;
			}
			if(!bookId_href[bookId]) continue;// 某些内容（比如公众号）在 books_bookId_href 中不存在数据
			let bookEl = document.createElement('a');
			const attributes = {target:"_blanck",textContent:book.title,href:bookId_href[bookId]}
			setAttributes(bookEl, attributes);
			booksContainer.appendChild(bookEl);
		}
		shelfContainer.appendChild(booksContainer);
		cateEl.addEventListener('click', dropdownClickEvent);
	}
}
