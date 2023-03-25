import 'arrive';

/* 主要用于实现阅读页主题色切换时加载相应样式文件 */
import $ from 'jquery';

import { loadCSS } from './content-utils';

function initTheme() {
	console.log('initTheme');
	/**
	 * 根据主题切换按钮 title 属性加载相应样式文件
	 * @param title 主题切换按钮 title 属性
	 */
	function loadThemeCSS(title: string) {
		const themeStyleElemId = 'wereader-theme-style-el';
		if(title == '浅色') {
			loadCSS("content/static/css/theme/dark.css", themeStyleElemId)
		}else if(title == '深色') {
			loadCSS("content/static/css/theme/white.css", themeStyleElemId)
		}
	}

	window.addEventListener('load', ()=>{
		const selector = '.readerControls_item.white,.readerControls_item.dark'
		const themeSwitch = document.querySelectorAll<HTMLElement>(selector)[0];
		if(themeSwitch) {
			// 初次加载
			const title = $(themeSwitch).attr('title')
			if(title) loadThemeCSS(title)
			// 监听主题切换按钮 title 属性变化
			const observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if(mutation.type == 'attributes' && mutation.attributeName == 'title') {
						const title = $(mutation.target).attr('title')
						if(title) loadThemeCSS(title)
					}
				});
			});
			observer.observe(themeSwitch, { attributes: true });
		}
	})
}

export { initTheme };