function wrapImageWithFancyBox(){
    $('img.wr_readerImage_opacity').each(function() {
        var image = $(this);
        image.css('cursor','pointer');
        image.on('click', function(){
            const src = $(this).attr('data-src');
            facnybox(src);
        });
    });
}

function facnybox(src){
    if($(".fancybox-overlay.fancybox-overlay-fixed").length !== 0) return;
    $("body").append(
        `<div class="fancybox-overlay fancybox-overlay-fixed">
            <div class="fancybox-wrap fancybox-desktop fancybox-type-image fancybox-opened">
                <div class="fancybox-skin">
                    <div class="fancybox-outer">
                        <div class="fancybox-inner">
                            <img class="fancybox-image" src="${src}">
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    );
    // 点击空白关闭图片
    $('.fancybox-overlay.fancybox-overlay-fixed').on('click', function(){
        $('.fancybox-overlay.fancybox-overlay-fixed').remove();
    });
    // 点击图片位置结束冒泡，避免关闭
    $('.fancybox-wrap.fancybox-desktop.fancybox-type-image.fancybox-opened').on('click', function(e){
        e.stopPropagation();
    });
}


// 使用扩展通知来处理切换章节后失效的问题
chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
    if(!msg.isFancybox) return;
    chrome.storage.sync.get(['enableFancybox'], function(result){
        if($('[data-fancybox="images"]').length) return;
        if(result.enableFancybox) wrapImageWithFancyBox();
    });
});