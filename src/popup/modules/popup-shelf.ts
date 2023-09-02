import $ from 'jquery';

import {
	Archive,
	Book,
	ShelfDataTypeJson,
	ShelfErrorDataType,
} from '../../types/shelfTypes';
import { initShelfReload } from './popup-shelf-reload';
import { createSearchInput } from './popup-shelf-search';
import { tabClickEvent } from './popup-tabs';
import {
	dropdownClickEvent,
	partSort,
} from './popup-utils';
import { puzzling } from '../../worker/worker-utils';
import { PopupApi } from '../../worker/types/PopupApi';
const popupApi = new PopupApi();
/* 初始化书架面板，先尝试从背景页获取数据，获取失败则直接调用背景页函数请求数据，最后初始化书架内容 */
async function initShelfTab() {
	/* 绑定书架 tab 按钮点击事件 */
	$('#shelfBtn').on('click', async function(){
		console.log('call: #shelfBtn.onclick');
		const res = await popupApi.shelfForPopup()
		let shelfData = res.shelfData
		// 从背景页获取数据无效
		if(Object.keys(shelfData).length === 0 || shelfData.errMsg){
			const resp: ShelfDataTypeJson | ShelfErrorDataType = await popupApi.getShelfData();
			if(resp.errMsg){	// 从服务端获取数据失败
				$('#shelf').html(`<a>正在加载...</a>`);
				const tab = await popupApi.createTab({url: `https://weread.qq.com`, active: false});
				if(tab){
					shelfData = await popupApi.setShelfData();
					if(shelfData.errMsg){
						return $('#shelf').html(`<a>加载失败，请先登陆。</a>`);
					}else $(this).trigger("click");
				}
			} else {	// 从服务端获取数据成功，保存数据到背景页
				shelfData = resp;
				popupApi.setShelfData(shelfData);
			}
		}
		console.log('call: #shelfBtn.onclick var shelfData\n', shelfData);
		createShelf(shelfData);
		createSearchInput();
	}).on('click', tabClickEvent);
	initShelfReload();
}


function getShelf(shelfData: ShelfDataTypeJson) {
	const {books, archive: categoryObjs} = shelfData;
	const bookId_book = books!.reduce((tempMap: {[propName: string]: Book}, curBook: Book)=>{
		tempMap[curBook.bookId] = curBook;
		return tempMap;
	},{});
	const shelf = categoryObjs!.reduce((
		tempShelf: {cateName: string, books: Book[], isTop?: boolean}[],
		curCate: Archive)=>{
		const cate: {cateName: string, books: Book[], isTop?: boolean} = {
			cateName: "",
			books: []
		};
		if (!curCate) return tempShelf;
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
	const extraCate: {cateName: string, books: Book[]} = {cateName: '未分类', books: []};
	for(const bookId in bookId_book){
		extraCate.books.push(bookId_book[bookId]);
	}
	if(extraCate.books.length) shelf.push(extraCate);
	shelf.forEach((cate)=>{
		// 书本排序
		cate.books.sort((x, y)=>{
			return (x.readUpdateTime > y.readUpdateTime) ? -1 : 1;
		});
		// 书本顶置
		const topBookIdx = [];
		for (let i = 0; i < cate.books.length; i++) {
			const book = cate.books[i];
			if (book && book.isTop) topBookIdx.push(i);
		}
		for (let i = 0; i < topBookIdx.length; i++) {
			const book = cate.books.splice(topBookIdx[i], 1)[0];
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
	const idx = [];
	for (let i = 0; i < shelf.length; i++) {
		const item = shelf[i]
		if (item && item.isTop) idx.push(i);
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
	const shelf = getShelf(shelfData);
	console.log('call: createShelf var shelf\n', shelf);
	const shelfContainer = $('#shelf').html('');
	/*创建目录*/
	for (const {cateName, books} of shelf) {
		// 遍历某一分类下的书本
		if(!books.length) continue;
		const booksContainer = $(`<div class='dropdown-container'></div>`);//章内书本容器
		for (const {bookId, title} of books) {
			const href = `https://weread.qq.com/web/reader/${puzzling(bookId)}`;
			const bookEl = $(`<a target='_blank' href='${href}'>${title}</a>`);
			// 为微信公众号绑定事件
			if(bookId && bookId.startsWith('MP_WXS_')){
				bookEl.on('click', async function(e){
					e.preventDefault();
					if (!bookId) return;
					const resp = await popupApi.createMpPage(bookId);
					if(resp && resp.errmsg) {
						console.log('mpOnclick', resp.errmsg);
						chrome.tabs.create({url: href});
					}
				});
			}
			booksContainer.append(bookEl);
		}
		// 某一分类元素
		const cateEl = $(`<button class='dropdown-btn'>${cateName}</button>`); 
		shelfContainer.append(cateEl, booksContainer);
		cateEl.on('click', dropdownClickEvent);
	}
}

export { initShelfTab };