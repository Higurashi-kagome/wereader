import $ from 'jquery'
/* 导出标注时的遮盖 */
function initMask() {
    console.log('initMask')
    chrome.runtime.onMessage.addListener((request) => {
        function removeMask() { $('.mask_parent.need_remove').remove() }
        if (request.isAddMask) {
            removeMask()
            const mask = $('<div class=\'mask_parent need_remove\'><div class="wr_mask wr_mask_Show"></div></div>')
            $('#routerView').append(mask)
            // 防止导出标注出错导致遮盖不被移除
            $(document).on('keydown', function () {
                removeMask()
            })
        } else if (request.isRemoveMask) {
            removeMask()
        }
    })
}

export { initMask }
