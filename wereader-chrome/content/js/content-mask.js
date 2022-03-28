/* 导出标注时的遮盖 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
	function removeMask() {$('.mask_parent.need_remove').remove();}
	if(request.isAddMask) {
		let mask = $(`<div class='mask_parent need_remove'><div class="wr_mask wr_mask_Show"></div></div>`);
		$('#routerView').append(mask);
		// 防止导出标注出错导致遮盖不被移除
		setTimeout(() => {removeMask();}, 5000);
	} else if (request.isRemoveMask) {
		removeMask();
	}
});