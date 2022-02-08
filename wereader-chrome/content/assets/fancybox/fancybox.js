// 图片等内容是动态加载的，所以监听 dom 的变化并随时重新为图片绑定点击事件
function fancyboxTargetObserver(){
    let observer = new MutationObserver(bindfancyBox);
    let target = document.getElementById('renderTargetContent').children[0];
    if(!target){
        window.setTimeout(fancyboxTargetObserver,500);
        return;
    }
    observer.observe(target, {'childList':true});
}

// 绑定点击事件
function bindfancyBox(){
    // 清除原点击事件
    let imgs = document.querySelectorAll("img.wr_readerImage_opacity");
    for (let i = 0; i < imgs.length; i++) {
        let img = imgs[i];
        imgClone = img.cloneNode(true);
        img.parentNode.replaceChild(imgClone, img);
    }
    // 绑定新事件
    $('img.wr_readerImage_opacity,#renderTargetContent pre').each(function() {
        let box = $(this);
        // box.css('cursor','pointer');
        box.on('click', function(){
            let boxInnerHTML;
            const src = $(this).attr('data-src');
            if(src) boxInnerHTML = `<img class="fancybox-image" src="${src}">`;
            else boxInnerHTML = `<pre class="fancybox-pre">${$(this).text()}</pre>`
            showFancybox(boxInnerHTML);
        });
    });
}

function showFancybox(boxInnerHTML){
    if($(".fancybox-overlay").length !== 0) return;
    // 插入
    $("body").append(
        `<div class="fancybox-overlay">
            <div class="fancybox-wrap">
                <div class="fancybox-skin">${boxInnerHTML}</div>
            </div>
        </div>`
    );
    // 点击空白移除
    $('.fancybox-overlay').on('click', function(){
        $('.fancybox-overlay').remove();
    });
    let fancyboxWrap = $('.fancybox-wrap');
    // 点击可见部分结束冒泡，避免关闭
    fancyboxWrap.on('click', function(e){
        e.stopPropagation();
    });
    // 随鼠标移动
    let [dx,dy,sx,sy,down] = [0,0,0,0,false];
    let view = $('.fancybox-image,.fancybox-pre');
    view.on('mousedown', function (e) {
        dx = e.clientX;
        dy = e.clientY;
        sx = parseInt(view.parent().parent().css('left'));
        sy = parseInt(view.parent().parent().css('top'));
        if (!down) down = true;
    });
    document.onmousemove = function(e){
        if (down) {
            view.parent().parent().css('top',e.clientY - (dy - sy) + 'px');
            view.parent().parent().css('left',e.clientX - (dx - sx) + 'px');
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
            bindfancyBox();
            fancyboxTargetObserver();
            // 绑定 esc 事件
            $(document).keydown(function (event) {
                let el = $('.fancybox-overlay')
                if (event.keyCode == 27 && el) {
                    el.remove();
                }
            });
        }
    });
});