/* 支持将想法中的 <> 转全角、支持 Ctrl+Enter 发布想法 */
import $ from "jquery";

function initThoughtEdit() {
	console.log('initThoughtEdit');
	window.addEventListener('load', ()=>{
		$('.app_content')[0].arrive('.writeReview_submit_button.wr_btn.wr_btn_Big', {onceOnly: true}, function(btn) {
			let $btn = $(btn);
			let textarea = $('#WriteBookReview');
			// 按键替代，实现字符替换
			let btnClone = $(btn.cloneNode(true)).on("click", ()=>{
				chrome.storage.sync.get(['enableThoughtEsc'], function(result){
					if(result.enableThoughtEsc) {
						let text = textarea.val() as string;
						let newText = text.replace(/</g, '＜').replace(/>/g, '＞');
						textarea.val(newText);
					}
					$btn.trigger("click");
				});
			});
			// Ctrl+Enter 发布
			textarea.on('keydown', (e)=>{
				if (e.ctrlKey && e.keyCode == 13) {
					btnClone.trigger("click");
				}
			});
			$btn.css('display', 'none');
			$btn.parent().prepend(btnClone as JQuery<JQuery.Node>);
		});
	});
}

export {initThoughtEdit};