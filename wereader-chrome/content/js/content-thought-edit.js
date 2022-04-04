/* 完善想法发布功能 */
window.addEventListener('load', ()=>{
	$('.app_content').arrive('.writeReview_submit_button.wr_btn.wr_btn_Big', {onceOnly: true}, (btn)=>{
		let textarea = $('#WriteBookReview');
		// 按键替代，实现字符替换
		let btnClone = $(btn.cloneNode(true)).click(()=>{
			chrome.storage.sync.get(['enableThoughtEsc'], function(result){
				if(result.enableThoughtEsc) {
					let text = textarea.val();
					let newText = text.replace(/</g, '＜').replace(/>/g, '＞');
					textarea.val(newText);
					console.log(text, '=>', newText);
				}
				btn.click();
			});
		});
		// Ctrl+Enter 发布
		textarea.on('keydown', (e)=>{
			if (e.ctrlKey && e.keyCode == 13) {
				btnClone.click();
			}
		});
		$(btn).css('display', 'none');
		$(btn).parent().prepend($(btnClone));
	});
})