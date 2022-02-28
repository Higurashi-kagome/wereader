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
				target: "_blank",
				textContent: book.title,
				href: `https://weread.qq.com/web/reader/${bg.puzzling(bookId)}`
			};
			setAttributes(bookEl, attributes);
			// 为微信公众号绑定事件
			if(bookId && bookId.startsWith('MP_WXS_')){
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
