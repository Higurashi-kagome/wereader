import 'jquery-mousewheel'

import $ from 'jquery'

import { loadCSS } from './content-utils'

function initFancyBox() {
    console.log('initFancyBox')
    loadCSS('content/static/css/fancybox.css', 'wereader-fancybox-style-el')
    // 图片等内容是动态加载的，所以监听 dom 的变化并随时重新为图片/代码块绑定点击事件
    function fancyboxTargetObserver() {
        // eslint-disable-next-line no-use-before-define
        const observer = new MutationObserver(bindFancyBox)
        const target = document.getElementById('renderTargetContent')!.children[0]
        if (!target) {
            window.setTimeout(fancyboxTargetObserver, 500)
            return
        }
        observer.observe(target, { childList: true })
    }

    // 绑定点击事件
    function bindFancyBox() {
    // 清除原点击事件
        const imgs = document.querySelectorAll('img.wr_readerImage_opacity')
        for (let i = 0; i < imgs.length; i++) {
            const img = imgs[i]
            const imgClone = img.cloneNode(true)
            img.parentNode!.replaceChild(imgClone, img)
        }
        // 绑定新事件
        $('img.wr_readerImage_opacity,#renderTargetContent pre').each(function () {
            $(this).on('click', function () {
                let boxInnerHTML
                const src = $(this).attr('data-src')
                if (src) boxInnerHTML = `<img class="fancybox-image" src="${src}">`
                else boxInnerHTML = `<pre class="fancybox-pre">${$(this).text()}</pre>`
                // eslint-disable-next-line no-use-before-define
                showFancybox(boxInnerHTML)
            })
        })
    }

    // fancybox 移动
    function bindMouseMove() {
        let [mousedownX, mousedownY, elLeft,
            elRight, elTop, elBottom, isMousedown] = [0, 0, 0, 0, 0, 0, false]
        const view = $('.fancybox-image,.fancybox-pre')
        view.on('mousedown', function (e) {
            // 客户端区域坐标。例如，客户端区域的左上角的 clientY 值为 0，这一值与页面是否有垂直滚动无关
            mousedownX = e.clientX // （向右为正，越靠右越大）
            mousedownY = e.clientY // （向下为正，越靠下越大）
            const wrap = view.parent().parent()
            // 页面坐标
            elLeft = parseFloat(wrap.css('left'))
            elRight = parseFloat(wrap.css('right'))
            elTop = parseFloat(wrap.css('top'))
            elBottom = parseFloat(wrap.css('bottom'))
            if (!isMousedown) isMousedown = true
        })
        // 加了动画，移动时可能超出 fancybox，所以绑定到 document
        $(document).on('mousemove', function (e) {
            if (isMousedown) {
                const wrap = view.parent().parent()
                wrap.css('top', elTop + e.clientY - mousedownY + 'px') // 元素原 top 值加鼠标 Y 方向偏移距离
                if (view.is('.fancybox-image')) wrap.css('bottom', elBottom + mousedownY - e.clientY + 'px') // 代码块用 resize 缩放
                wrap.css('left', elLeft + e.clientX - mousedownX + 'px') // 元素原 left 值加鼠标 X 方向偏移距离
                if (view.is('.fancybox-image')) wrap.css('right', elRight + mousedownX - e.clientX + 'px') // 代码块用 resize 缩放
            }
        })
        $(document).on('mouseup', function () {
            if (isMousedown) isMousedown = false
        })
    }

    // fancybox 滚轮缩放
    function bindMouseWheel() {
        let [elLeft, elRight, elTop, elBottom] = [0, 0, 0, 0]
        const img = $('.fancybox-image')
        img.on('mousewheel', function (e) {
            e.preventDefault()
            // 获取 wrap 位置
            const wrap = img.parent().parent()
            elLeft = parseFloat(wrap.css('left'))
            elRight = parseFloat(wrap.css('right'))
            elTop = parseFloat(wrap.css('top'))
            elBottom = parseFloat(wrap.css('bottom'))
            const height = parseFloat(wrap.css('height'))
            const rate = parseFloat(wrap.css('width')) / height
            const totalPx = 20 // top 和 bottom 的总改变量
            // 获取定点缩放数据
            const mousedownX = e.clientX // （向右为正，越靠右越大）
            const mousedownY = e.clientY // （向下为正，越靠下越大）
            const imgRect = img[0].getBoundingClientRect() // https://javascript.info/coordinates
            const leftDist = mousedownX - imgRect.left
            const rightDist = imgRect.width - leftDist
            const topDist = mousedownY - imgRect.top
            const bottomDist = imgRect.height - topDist
            const topPx = (totalPx * topDist) / imgRect.height
            const bottomPx = (totalPx * bottomDist) / imgRect.height
            const leftPx = (totalPx * rate * leftDist) / imgRect.width
            const rightPx = (totalPx * rate * rightDist) / imgRect.width
            // 缩放
            if (e.deltaY < 0) {
                wrap.css('top', elTop + topPx + 'px')
                wrap.css('bottom', elBottom + bottomPx + 'px')
                wrap.css('left', elLeft + leftPx + 'px')
                wrap.css('right', elRight + rightPx + 'px')
            } else {
                wrap.css('top', elTop - topPx + 'px')
                wrap.css('bottom', elBottom - bottomPx + 'px')
                wrap.css('left', elLeft - leftPx + 'px')
                wrap.css('right', elRight - rightPx + 'px')
            }
            // 移除限制，方便缩放
            img.css('max-height', 'none')
            img.css('max-width', 'none')
            wrap.css('max-height', 'none')
        })
    }

    function showFancybox(boxInnerHTML: string) {
        if ($('.fancybox-overlay').length !== 0) return
        // 插入
        $('body').append(
            `<div class="fancybox-overlay">
                <div class="fancybox-wrap">
                    <div class="fancybox-skin">${boxInnerHTML}</div>
                </div>
            </div>`
        )
        $('.fancybox-pre').parent().addClass('pre')
        // 点击空白移除
        $('.fancybox-overlay').on('click', function () {
            $('.fancybox-overlay').remove()
        })
        // 点击可见部分结束冒泡，避免关闭
        $('.fancybox-wrap').on('click', function (e) {
            e.stopPropagation()
        })
        bindMouseMove()
        bindMouseWheel()
    }

    $(function () { // 比 onload 事件先执行
        chrome.storage.sync.get(['enableFancybox'], function (result) {
            if (result.enableFancybox) {
                bindFancyBox()
                fancyboxTargetObserver()
                // 处理切换章节后失效的问题
                const content = $('.app_content')[0] || $('.wr_horizontalReader_app_content')[0]
                content.arrive('.readerChapterContent', function () {
                    chrome.storage.sync.get(['enableFancybox'], function (r) {
                        if (r.enableFancybox) {
                            bindFancyBox()
                            fancyboxTargetObserver()
                        }
                    })
                })
            }
        })
    })
}

export { initFancyBox }
