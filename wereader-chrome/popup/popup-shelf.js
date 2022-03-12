/* 初始化书架面板，先尝试从背景页获取数据，获取失败则直接调用背景页函数请求数据，最后初始化书架内容 */
$('#shelfBtn').on('click', async ()=>{
	let shelfData = bg.shelfForPopup.shelfData;
	// 从背景页获取数据无效
	if(!shelfData || shelfData.errMsg){
		const resp = await bg.getShelfData();
		if(resp.errMsg){	// 从服务端获取数据失败
			$('#shelf').html(`<a>正在加载...</a>`);
			let tab = await bg.createTab({url: 'https://weread.qq.com/', active: false});
			if(tab){
				shelfData = await bg.setShelfData();
				if(shelfData.errMsg){
					return $('#shelf').html(`<a>加载失败，请先登陆。</a>`);
				}else $(this).click();
			}
		} else {	// 从服务端获取数据成功，保存数据到背景页
			shelfData = resp;
			bg.setShelfData(shelfData);
		}
	}
	createShelf(shelfData);
	createSearchInput();
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
		cate.isTop = curCate.isTop;
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
	shelf.forEach(cate=>{
		// 书本排序
		cate.books.sort((x,y)=>{
			return (x.readUpdateTime > y.readUpdateTime) ? -1 : 1;
		});
		// 书本顶置
		let topBookIdx = [];
		for (let i = 0; i < cate.books.length; i++) {
			let book = cate.books[i];
			if (book.isTop) topBookIdx.push(i);
		}
		for (let i = 0; i < topBookIdx.length; i++) {
			let book = cate.books.splice(topBookIdx[i], 1)[0];
			cate.books.unshift(book);
		}
		// 顶置书本排序
		if (topBookIdx.length) {
			partSort(cate.books, 0, topBookIdx.length - 1, (x,y)=>{
				return (x.readUpdateTime > y.readUpdateTime) ? -1 : 1;
			});
		}
	});
	// 分类排序
	shelf.sort((x,y)=>{
		try { // 分类为空时会报错
			return (x.books[0].readUpdateTime > y.books[0].readUpdateTime) ? -1 : 1;
		} catch (error) {}
	});
	// 分类顶置
	let idx = [];
	for (let i = 0; i < shelf.length; i++) {
		if (shelf[i].isTop) idx.push(i);
	}
	for (let i = 0; i < idx.length; i++) {
		shelf.unshift(shelf.splice(idx[i], 1)[0]);
	}
	// 顶置分类排序
	if (idx.length) {
		partSort(shelf, 0, idx.length - 1, (x,y)=>{
			try { // 分类为空时会报错
				return (x.books[0].readUpdateTime > y.books[0].readUpdateTime) ? -1 : 1;
			} catch (error) {}
		});
	}
	return shelf;
}

function createShelf(shelfData){
	let shelf = getShelf(shelfData);
	let shelfContainer = $('#shelf').html('');
	/*创建目录*/
	for (const {cateName, books} of shelf) {
		// 遍历某一分类下的书本
		if(!books.length) continue;
		let booksContainer = $(`<div class='dropdown-container'></div>`);//章内书本容器
		for (const {bookId, title} of books) {
			const href = `https://weread.qq.com/web/reader/${bg.puzzling(bookId)}`;
			let bookEl = $(`<a target='_blank' href='${href}'>${title}</a>`);
			// 为微信公众号绑定事件
			if(bookId && bookId.startsWith('MP_WXS_')){
				bookEl.on('click', async function(e){
					e.preventDefault();
					if (!bookId) return;
					let resp = await bg.createMpPage(bookId);
					if(resp && resp.errmsg) {
						console.log('mpOnclick', resp.errmsg);
						chrome.tabs.create({url: href});
					}
				});
			}
			booksContainer.append(bookEl);
		}
		// 某一分类元素
		let cateEl = $(`<button class='dropdown-btn'>${cateName}</button>`); 
		shelfContainer.append(cateEl, booksContainer);
		cateEl.on('click', dropdownClickEvent);
	}
}


// https://www.geeksforgeeks.org/sort-the-array-in-a-given-index-range/
function partSort(arr, a, b, fun = function(a, b){return a - b})
{
	// Variables to store start and end of the index range
	let l = Math.min(a, b);
	let r = Math.max(a, b);

	// Temporary array
	let temp = new Array(r - l + 1);
	for (let i = l, j = 0; i <= r; i++, j++) {
		temp[j] = arr[i];
	}

	// Sort the temporary array
	temp.sort(fun);

	// Modifying original array with temporary array elements
	for (let i = l, j = 0; i <= r; i++, j++) {
		arr[i] = temp[j];
	}
}
