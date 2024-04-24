import 'arrive'

/* 主要用于实现阅读页主题色切换时加载相应样式文件 */
import $ from 'jquery'
import Swal from 'sweetalert2'

import { loadCSS, unloadCSS } from './content-utils'

let curFlag = 0

const tag = 'content-theme: '

/**
 * 判断当前为 white 还是 dark 主题
 */
function getDarkOrWhite(): string {
    const white = $('.readerControls_item.white')
    const dark = $('.readerControls_item.dark')
    if (white.length) {
        return 'white'
    } if (dark.length) {
        return 'dark'
    }
    return ''
}

/**
 * 根据主题切换按钮 title 属性加载相应黑白主题样式文件
 * @param title 主题切换按钮 title 属性
 */
function loadDarkWhiteCSS(title: string) {
    const darkWhiteStyleId = 'wereader-dark-white-style-el'
    if (title === '浅色') {
        loadCSS('content/static/css/theme/dark.css', darkWhiteStyleId)
    } else if (title === '深色') {
        loadCSS('content/static/css/theme/white.css', darkWhiteStyleId)
    }
}

/**
 * 按主题号获取主题名称
 * @param currentFlag 当前主题号
 */
function getThemeName(currentFlag: number) {
    const themeMap = new Map<number, string>()
    themeMap.set(0, 'green')
    themeMap.set(1, 'orange')
    themeMap.set(2, 'dark')
    themeMap.set(-1, 'white')
    return themeMap.get(currentFlag)
}

/**
 * 更新水平阅读模式下的样式
 */
function updateHorizontalStyle() {
    const otherThemeStyleId = 'wereader-other-theme-style-el'
    const theme = getThemeName(curFlag)
    if (theme && ['dark', 'white'].includes(theme)) {
        unloadCSS(otherThemeStyleId)
        return
    }
    const horizontalReader = $('.isHorizontalReader')
    if (horizontalReader.length) {
        if (theme && ['green', 'orange'].includes(theme)) {
            loadCSS(`content/static/css/theme/${theme}-two.css`, otherThemeStyleId)
        }
    } else {
        unloadCSS(otherThemeStyleId)
    }
}

/**
 * 传入主题对应数值，切换到相应主题
 * @param currentFlag 所需要切换到的主题所对应的数值
 * @param event 点击事件，用来控制冒泡或阻止冒泡，进而控制切换黑白色主题
 */
function changeTheme(currentFlag: number, event?: JQuery.ClickEvent) {
    const themeStyleId = 'wereader-theme-style-el'
    const white = $('.readerControls_item.white')
    const dark = $('.readerControls_item.dark')
    // 数值与主题对应关系
    const theme = getThemeName(currentFlag)
    console.log(tag, '切换主题 - ', theme)
    const darkOrWhite = getDarkOrWhite()
    switch (currentFlag) {
    case 0:
        // 设置绿色主题
        // eslint-disable-next-line no-fallthrough
    case 1:
        // 设置橙色主题
        if (darkOrWhite === 'dark' && event) event.stopPropagation()
        loadCSS(`content/static/css/theme/${theme}.css`, themeStyleId)
        break
    case 2:
        // 设置黑色主题
        unloadCSS(themeStyleId)
        if (darkOrWhite === 'white' && event) event.stopPropagation()
        break
    case -1:
        // 设置白色主题
        unloadCSS(themeStyleId)
        if (darkOrWhite === 'dark' && event) event.stopPropagation()
        break
    default:
        if (white.length) {
            currentFlag = -1
        } else if (dark.length) {
            currentFlag = 2
        }
        break
    }
    curFlag = currentFlag
    updateHorizontalStyle()
    chrome.storage.sync.set({ flag: currentFlag }, function () {
        if (chrome.runtime.lastError) alert('存储出错')
    })
}

/**
 * 添加主题切换按钮并绑定点击事件
 */
function addThemeBtn() {
    // 创建主题切换按钮
    const themeBtn = $('<button title=\'主题\' class=\'readerControls_item theme\'></button>')
    themeBtn.append($('<span>主题</span>'))
    themeBtn.attr('z-index', 100)
    // 隐藏原主题切换按钮图标
    $('.readerControls_item.white > .icon,.readerControls_item.dark > .icon').css('display', 'none').before(themeBtn)
    // 主题切换按钮点击事件
    themeBtn.on('click', function onClick(event) {
        try {
            $('.readerControls_item.theme').css('display', 'none')
            $('.theme_switcher').css('display', 'flex')
            const selector = '.readerControls_item.white,.readerControls_item.dark'
            $(selector).css('width', 'max-content')
            $('.theme-switch-left').hide()
            event.stopPropagation()
        } catch (error) {
            Swal.fire({
                title: 'Oops...', text: '似乎出了点问题，刷新一下试试吧~', icon: 'error', confirmButtonText: 'OK'
            })
        }
    })
}

/**
 * 添加主题切换
 */
function addThemeSwitcher() {
    $('.readerControls_item.white > .icon,.readerControls_item.dark > .icon').before($(`<div class="readerControls_fontSize expand theme_switcher" style="
        width: 160px; display: none; margin-top: 0;">
    <div class="fontSizeLabel left theme-switch-left"><span>主题</span></div>
    <div class="fontSizeSliderContainer theme-switch-container cursor-default">
    <span style="background: #E8DDC2;" data-theme-index="1"></span>
    <span style="background: #bee5c5;" data-theme-index="0"></span>
    <span style="background: black;" data-theme-index="2"></span>
    <span style="background: white;" data-theme-index="-1"></span></div></div>`))
    // 不同主题按钮
    const itemClass = 'theme-switch-item'
    $('.theme-switch-container span').addClass([itemClass, 'cursor-pointer'])
        .on('click', function onClick(e) {
            const themeIndex = $(this).data('themeIndex')
            changeTheme(themeIndex, e)
        })
    // 点击父元素时关闭冒泡
    $('.theme-switch-container,.theme-switch-left').on('click', function handleClick(e) {
        if (!$(e.target).is(`.${itemClass}`)) e.stopPropagation()
    })
    // 隐藏面板
    $(document).add('.theme-switch-left').on('click', function handleHideSwitcher(e) {
        // 不是点击切换选项时关闭切换面板
        if (!$(e.target).is(`.${itemClass}`)) {
            $('.theme_switcher').css('display', 'none')
            $('.readerControls_item.theme').css('display', 'inline-block')
        }
    })
}

function initTheme() {
    console.log(tag, 'initTheme')
    // 主题初始化（记住上次设置的背景主题）
    document.arrive('.readerControls_item', { onceOnly: true }, function () {
        chrome.storage.sync.get(['flag'], function (result) {
            console.log(tag, '主题初始化 - ', result.flag)
            curFlag = result.flag
            changeTheme(curFlag)
        })
    })
    // 黑白色主题切换监听、插入主题切换按钮
    window.addEventListener('load', () => {
        const selector = '.readerControls_item.white,.readerControls_item.dark'
        const themeSwitch = document.querySelectorAll<HTMLElement>(selector)[0]
        if (themeSwitch) {
            // 初次加载黑白色主题样式文件
            let title = $(themeSwitch).attr('title')
            if (title) loadDarkWhiteCSS(title)
            // 监听主题切换按钮 title 属性变化
            const observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
                        title = $(mutation.target).attr('title')
                        console.log(tag, '黑白主题切换', title)
                        if (title) loadDarkWhiteCSS(title)
                    }
                })
            })
            observer.observe(themeSwitch, { attributes: true })
            addThemeBtn()
            addThemeSwitcher()
            // 绑定水平阅读按钮点击事件，点击后更新样式
            $('.readerControls_item.isHorizontalReader').on('click', updateHorizontalStyle)
        }
    })
}

export { initTheme }
