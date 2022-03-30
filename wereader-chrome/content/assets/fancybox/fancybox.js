// 图片等内容是动态加载的，所以监听 dom 的变化并随时重新为图片绑定点击事件
function fancyboxTargetObserver(){
    let observer = new MutationObserver(bindFancyBox);
    let target = document.getElementById('renderTargetContent').children[0];
    if(!target){
        window.setTimeout(fancyboxTargetObserver,500);
        return;
    }
    observer.observe(target, {'childList':true});
}

// 绑定点击事件
function bindFancyBox(){
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
	$(".fancybox-pre").parent().addClass("pre");
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
	let [mousedownX,mousedownY,elLeft,elRight,elTop,elBottom,isMousedown] = [0,0,0,0,0,0,false];
	let view = $('.fancybox-image,.fancybox-pre');
	view.on('mousedown', function (e) {
		// 客户端区域坐标。例如，客户端区域的左上角的 clientY 值为 0 ，这一值与页面是否有垂直滚动无关
		mousedownX = e.clientX; // （向右为正，越靠右越大）
		mousedownY = e.clientY; // （向下为正，越靠下越大）
		let wrap = view.parent().parent();
		// 页面坐标
		elLeft = parseFloat(wrap.css('left'));
		elRight = parseFloat(wrap.css('right'));
		elTop = parseFloat(wrap.css('top'));
		elBottom = parseFloat(wrap.css('bottom'));
		if (!isMousedown) isMousedown = true;
	});
	document.onmousemove = function(e){
		if (isMousedown) {
			let wrap = view.parent().parent();
			// 元素原 top 值加鼠标 Y 方向偏移距离
			wrap.css('top', elTop + e.clientY - mousedownY + 'px');
			wrap.css('bottom', elBottom + mousedownY - e.clientY + 'px');
			// 元素原 left 值加鼠标 X 方向偏移距离
			wrap.css('left',elLeft + e.clientX - mousedownX + 'px');
			wrap.css('right',elRight + mousedownX - e.clientX + 'px');
		}
	}
	document.onmouseup = function(){
		if (isMousedown) isMousedown = false;
	}
	// 滚轮缩放
	let img = $('.fancybox-image');
	img.on('mousewheel', function(event) {
		event.preventDefault();
		let wrap = img.parent().parent();
		elLeft = parseFloat(wrap.css('left'));
		elRight = parseFloat(wrap.css('right'));
		elTop = parseFloat(wrap.css('top'));
		elBottom = parseFloat(wrap.css('bottom'));
		let height = parseFloat(wrap.css('height'));
		let rate = parseFloat(wrap.css('width')) / height;
		const dist = 10;
		if (event.deltaY < 0) {
			wrap.css('top', elTop + dist + 'px');
			wrap.css('bottom', elBottom + dist + 'px');
			wrap.css('left', elLeft + dist*rate + 'px');
			wrap.css('right', elRight + dist*rate + 'px');
		} else {
			wrap.css('top', elTop - dist + 'px');
			wrap.css('bottom', elBottom - dist + 'px');
			wrap.css('left', elLeft - dist*rate + 'px');
			wrap.css('right', elRight - dist*rate + 'px');
		}
		// 移除限制，方便缩放
		img.css('max-height', 'none');
		img.css('max-width', 'none');
		wrap.css('max-height', 'none');
	});
}

window.addEventListener('load', ()=>{
	chrome.storage.sync.get(['enableFancybox'], function(result){
		if(result.enableFancybox) {
			bindFancyBox();
			fancyboxTargetObserver();
			// 处理切换章节后失效的问题
			$('.app_content').arrive('.readerChapterContent', ()=>{
				chrome.storage.sync.get(['enableFancybox'], function(result){
					if(result.enableFancybox) {
						bindFancyBox();
						fancyboxTargetObserver();
					}
				});
			});
		}
	});
})