/* 初始化书架面板，先尝试从背景页获取数据，获取失败则直接调用背景页函数请求数据，最后初始化书架内容 */
document.getElementById('shelfBtn').addEventListener('click', async (event)=>{
	let shelfData = bg.shelfForPopup.shelfData;
	if(!shelfData || shelfData.errMsg){
		const resp = await bg.getShelfData();
		if(resp.errMsg){
			document.getElementById('shelf').innerHTML = `<a>正在加载...</a>`;
			let tab = await bg.createTab({url: 'https://weread.qq.com/', active: false});
			if(tab){
				shelfData = await bg.setShelfData();
				if(shelfData.errMsg){
					document.getElementById('shelf').innerHTML = `<a>加载失败，请先登陆。</a>`;
					return;
				}else{
					event.target.click();
				}
			}
		} else {
			shelfData = resp;
			bg.setShelfData(shelfData);
		}
	}
	createShelf(shelfData);
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

function createShelf(shelfData){
	let shelf = getShelf(shelfData);
    let shelfContainer = document.getElementById('shelf');
	shelfContainer.innerHTML = '';
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
			let bookId = book.bookId;
			let bookEl = document.createElement('a');
			const attributes = {
                target:"_blanck", 
                textContent:book.title, 
                href: `https://weread.qq.com/web/reader/${bg.puzzling(bookId)}`
            };
			setAttributes(bookEl, attributes);
            // 为微信公众号绑定事件
			if(bookId.startsWith('MP_WXS_')){
				bookEl.onclick = async function(e){
					e.preventDefault();
					if (!bookId) return;
					let resp = await bg.createMpPage(bookId);
					if(resp && resp.errmsg) {
						console.log('mpOnclick', resp.errmsg);
						chrome.tabs.create({url: attributes.href});
					}
				}
			}
			booksContainer.appendChild(bookEl);
		}
		shelfContainer.appendChild(booksContainer);
		cateEl.addEventListener('click', dropdownClickEvent);
	}
}
