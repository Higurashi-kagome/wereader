// 图片等内容是动态加载的，所以监听 dom 的变化并随时重新为图片绑定点击事件
function imageObserver(){
    let observer = new MutationObserver(wrapImageWithFancyBox);
    let target = document.getElementById('renderTargetContent').children[0];
    if(!target){
        window.setTimeout(imageObserver,500);
        return;
    }
    observer.observe(target, {'childList':true});
}

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
                    <img class="fancybox-image" src="${src}">
                </div>
            </div>
        </div>`
    );
    // 点击空白关闭图片
    $('.fancybox-overlay.fancybox-overlay-fixed').on('click', function(){
        $('.fancybox-overlay.fancybox-overlay-fixed').remove();
    });
    let view = $('.fancybox-wrap.fancybox-desktop.fancybox-type-image.fancybox-opened');
    let [dx,dy,sx,sy,down] = [0,0,0,0,false];
    // 点击图片位置结束冒泡，避免关闭
    view.on('click', function(e){
        e.stopPropagation();
    });
    let image = $('.fancybox-image');
    image.on('mousedown', function (e) {
        dx = e.clientX;
        dy = e.clientY;
        sx = parseInt(image.parent().parent().css('left'));
        sy = parseInt(image.parent().parent().css('top'));
        if (!down) down = true;
    });
    document.onmousemove = function(e){
        if (down) {
            image.parent().parent().css('top',e.clientY - (dy - sy) + 'px');
            image.parent().parent().css('left',e.clientX - (dx - sx) + 'px');
        }
    }
    document.onmouseup = function(){
        if (down) down = false;
    }
}


// 使用扩展通知来处理切换章节后失效的问题
chrome.runtime.onMessage.addListener(function(msg){
    if(!msg.isFancybox) return;
    chrome.storage.sync.get(['enableFancybox'], function(result){
        if(result.enableFancybox) {
            wrapImageWithFancyBox();
            imageObserver();
        }
    });
});