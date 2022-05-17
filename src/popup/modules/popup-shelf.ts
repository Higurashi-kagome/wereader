import $ from "jquery";
import { createSearchInput } from "./popup-shelf-search";
import { bg, dropdownClickEvent, partSort } from "./popup-utils";
import { Archive, Book, ShelfDataTypeJson, ShelfErrorDataType } from "../../types/shelfTypes";

/* 初始化书架面板，先尝试从背景页获取数据，获取失败则直接调用背景页函数请求数据，最后初始化书架内容 */
function initShelfTab() {
	/* 绑定书架 tab 按钮点击事件 */
	$('#shelfBtn').on('click', async function(){
		let shelfData = bg.shelfForPopup.shelfData;
		// 从背景页获取数据无效
		if(!shelfData || shelfData.errMsg){
			const resp: ShelfDataTypeJson | ShelfErrorDataType = await bg.getShelfData();
			if(resp.errMsg){	// 从服务端获取数据失败
				$('#shelf').html(`<a>正在加载...</a>`);
				let tab = await bg.createTab({url: 'https://weread.qq.com/', active: false});
				if(tab){
					shelfData = await bg.setShelfData();
					if(shelfData.errMsg){
						return $('#shelf').html(`<a>加载失败，请先登陆。</a>`);
					}else $(this).trigger("click");
				}
			} else {	// 从服务端获取数据成功，保存数据到背景页
				shelfData = resp;
				bg.setShelfData(shelfData);
			}
		}
		createShelf(shelfData);
		createSearchInput();
	});

	/* 绑定书架刷新按钮点击事件 */
	(function(){
		const shelfBtn = $('#shelfBtn');
		shelfBtn.html(shelfBtn.html() + `<span id='reload' title="刷新">&#x21bb;</span>`)
		$('#reload').on('click', async (e)=>{
			e.stopPropagation();
			$('#shelf').html(`<a>正在加载...</a>`);
			await bg.setShelfData();
			e.target.parentElement!.click();
		});
	})();
}


function getShelf(shelfData: ShelfDataTypeJson) {
	let {books, archive: categoryObjs} = shelfData;
	let bookId_book = books!.reduce((tempMap: {[propName: string]: Book}, curBook: Book)=>{
		tempMap[curBook.bookId] = curBook;
		return tempMap;
	},{});
	let shelf = categoryObjs!.reduce((
		tempShelf: {cateName: string, books: Book[], isTop?: boolean}[],
		curCate: Archive)=>{
		let cate: {cateName: string, books: Book[], isTop?: boolean} = {
			cateName: "",
			books: []
		};
		cate.cateName = curCate.name;
		cate.books = [];
		cate.isTop = curCate.isTop;
		curCate.bookIds.forEach(bookId => {
			cate.books.push(bookId_book[bookId]);
			delete bookId_book[bookId];
		});
		tempShelf.push(cate);
		return tempShelf;
	},[]);
	//将书架中未分类的书籍归为 "未分类书籍"
	// TODO: 不应该将未分类的书籍分类
	let extraCate: {cateName: string, books: Book[]} = {cateName: '未分类', books: []};
	for(let bookId in bookId_book){
		extraCate.books.push(bookId_book[bookId]);
	}
	if(extraCate.books.length) shelf.push(extraCate);
	shelf.forEach((cate)=>{
		// 书本排序
		cate.books.sort((x, y)=>{
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
	shelf.sort((x, y)=>{
		try { // 分类为空时会报错
			return (x.books[0].readUpdateTime > y.books[0].readUpdateTime) ? -1 : 1;
		} catch (error) {
			// TODO: 检查是否可以这样写（更好的处理方式）
			return 0;
		}
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
			} catch (error) {
				// TODO: 确定是否可以这样写（更好的处理方式）
				return 0;
			}
		});
	}
	return shelf;
}

function createShelf(shelfData: ShelfDataTypeJson){
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

export {initShelfTab};