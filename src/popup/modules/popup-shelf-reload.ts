import $ from 'jquery';

import { bg } from './popup-utils';

/* 绑定书架刷新按钮点击事件 */
export function initShelfReload(){
	const shelfBtn = $('#shelfBtn');
	shelfBtn.html(shelfBtn.html() + `<span id='reload' title="刷新">&#x21bb;</span>`)
	$('#reload').on('click', async (e)=>{
		e.stopPropagation();
		$('#shelf').html(`<a>正在加载...</a>`);
		await bg.setShelfData();
		e.target.parentElement!.click();
	});
}