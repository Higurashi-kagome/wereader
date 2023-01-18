<template>
	<el-tab-pane label="书架" @click="onShelfClick" v-loading="loading">
		<input type="text" v-model="shelfSearchInput" style="width: -webkit-fill-available; font-style: italic; font-size: 13px; padding: 10px 17px 10px 17px; border: 1px solid #ddd; " placeholder="搜索...">
		<div v-for="(cate, $index) in shelf" :key="cate.cateName">
			<button class='dropdown-btn' :class="{active: dropdownActive.indexOf($index) > -1}"
			@click="onDropDownClick($index)">{{cate.cateName}}</button>
			<div class='dropdown-container' v-show="dropdownActive.indexOf($index) > -1">
				<a target='_blank' v-for="book in cate.books" :key="book.bookId" 
				:href="'https://weread.qq.com/web/reader/' + puzzling(book.bookId)"
				@click="onBookClick(book.bookId, $event)"
				v-show="!shelfSearchInput || book.title.indexOf(shelfSearchInput) > -1">{{book.title}}</a>
			</div>
		</div>
	</el-tab-pane>
</template>

<script lang='ts'>
import {
	Archive,
	Book,
	ShelfDataTypeJson,
	ShelfErrorDataType,
} from '../../types/shelfTypes'
import {
	bg,
	partSort,
} from '../modules/popup-utils'
type DataType = {
	loading: boolean;
	shelf: object;
	dropdownActive: number[];
	shelfSearchInput: string;
};
export default {
	name: 'Shelf',
	data (): DataType {
		return {
			loading: true,
			shelf: {},
			dropdownActive: [],
			shelfSearchInput: ''
		}
	},
	methods: {
		puzzling(bookId: string) {
			return bg.puzzling(bookId);
		},
		async onBookClick(bookId: string, e: any) {
			const href = e.currentTarget.getAttribute('href')
			if(bookId && bookId.startsWith('MP_WXS_')){
				e.preventDefault()
				let resp = await bg.createMpPage(bookId);
				if(resp && resp.errmsg) {
					chrome.tabs.create({url: href});
				}
			}
		},
		onDropDownClick(index: number) {
			let i = this.dropdownActive.indexOf(index);
			if(i > -1){
				this.dropdownActive.splice(i, 1);
			}else{
				this.dropdownActive.push(index);
			}
		},
		async onShelfClick(){
			this.loading = true
			let shelfData = bg.shelfForPopup.shelfData;
			// 从背景页获取缓存数据无效
			if(Object.keys(shelfData).length === 0 || shelfData.errMsg){
				const resp: ShelfDataTypeJson | ShelfErrorDataType = await bg.getShelfData();
				// 从服务端获取数据失败
				if(resp.errMsg){
					let tab: chrome.tabs.Tab = await bg.createTab({url: bg.Wereader.maiUrl, active: false});
					if(tab){
						shelfData = await bg.setShelfData();
						if(shelfData.errMsg){
							this.$alert('加载失败', '请先登陆', {
								confirmButtonText: '确定',
								callback: action => {
									if(action == 'confirm'){
										let {windowId, index: tabs} = tab;
										chrome.tabs.highlight({windowId, tabs});
										chrome.windows.update(windowId, {focused: true});
									}
								}
							});
							this.loading = false
							return
						}
					}
				// 从服务端获取数据成功，保存数据到背景页
				} else {
					shelfData = resp;
					bg.setShelfData(shelfData);
				}
			}
			this.shelf = this.getShelf(shelfData);
		},
		getShelf(shelfData: ShelfDataTypeJson) {
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
	}
}
</script>

<style scoped>

</style>