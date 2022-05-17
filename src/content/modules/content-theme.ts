/* 主要用于实现阅读页主题色切换，另外还负责从 content-scroll.js 中调用函数帮助实现进度*/
import $ from "jquery";
import Swal from "sweetalert2";
import "arrive";
import { loadCSS } from "./content-utils";

function initTheme() {
	console.log('initTheme');
	const themeStyleElemId = 'wereader-theme-style-el';
	var Flag = 0;
	
	// 添加主题切换按钮并绑定点击事件
	function addThemeBtn(){
		// 创建
		let theme = $(`<button title='主题' class='readerControls_item theme'></button>`);
		theme.append($('<span>主题</span>'));
		$('.readerControls_item.white,.readerControls_item.dark').css('display', 'none').before(theme);
		// 点击事件
		theme.on('click', ()=>{
			try{
				changeTheme(); Flag = Flag + 1;
			}catch (error) {
				Swal.fire({title: "Oops...",text: "似乎出了点问题，刷新一下试试吧~",icon: "error",confirmButtonText: 'OK'});
			}
		});
		
		//改变主题
		function changeTheme(){
			//如果当前主题为夜色模式
			if($('.readerControls_item.white').length){
				//设置白色主题
			    Flag=-1
				loadCSS("theme/white.css", themeStyleElemId)
				$('.readerControls_item.white').trigger("click");
			}else if(Flag == 0){
				//设置绿色主题
				if($('.readerControls_item.white').length){
					$('.readerControls_item.white').trigger("click");
				}
				loadCSS("theme/green.css", themeStyleElemId)
			}else if(Flag == 1){
				//设置橙色主题
				if($('.readerControls_item.white').length){
					$('.readerControls_item.white').trigger("click");
				}
				loadCSS("theme/orange.css", themeStyleElemId)
			}else if(Flag == 2){
				//设置黑色主题
				loadCSS("theme/dark.css", themeStyleElemId)
				$('.readerControls_item.dark').trigger("click");
			}
			//保存当前主题对应编号
			chrome.storage.sync.set({flag: Flag},function(){
				if(chrome.runtime.lastError)alert("存储出错")
			})
		}
	}
	
	// 主题初始化（记住上次设置的背景主题）
	document.arrive('.readerControls_item', {onceOnly: true}, function() {
		chrome.storage.sync.get(['flag'], function(result) {
			if(result.flag === 0){
				//设置绿色主题
				$('.readerControls_item.white').trigger("click");
				loadCSS("theme/green.css", themeStyleElemId)
				// 绿色的下一个为橙色（1）
				Flag = 1
			}else if(result.flag === 1){
				//设置橙色主题
				$('.readerControls_item.white').trigger("click");
				loadCSS("theme/orange.css", themeStyleElemId)
				// 橙色的下一个为黑色（2）
				Flag = 2
			}else if(result.flag === 2){
				// 设置黑色主题
				loadCSS("theme/dark.css", themeStyleElemId)
				$('.readerControls_item.dark').trigger("click");
			} else if(result.flag === -1){
				// 设置白色主题
				loadCSS("theme/white.css", themeStyleElemId)
				$('.readerControls_item.white').trigger("click");
			}
		});
	});

	// 添加按钮
	window.addEventListener('load', ()=>{
		// 主题切换按钮
		const themeSwitch = document.querySelectorAll<HTMLElement>(".readerControls_item.white,.readerControls_item.dark")[0];
		if(themeSwitch != undefined && themeSwitch.style.display != "none") addThemeBtn();
	});
}

export {initTheme};