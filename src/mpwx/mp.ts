import $ from "jquery";
import { mpTypeJson } from "../types/mpTypes";
import { timeConverter } from "./mp-utils";

$(function(){
    /* 插入容器 */
    let _mpBox = $(`<div id="webook_mp_scroll"><div><div id="webook_mp_list"></div>
    <div id="webook_mp_load_more">加载更多</div></div></div>`)
    $('body').append(_mpBox)
    function getHtml(data: mpTypeJson, sync: { [key: string]: any}) {
        let {mpShrink, mpContent} = sync
        let html = '', tempEl = document.createElement('div')
        data.reviews.forEach(function(curr, index) {
            if (curr.review && curr.review.mpInfo) {
                let mpInfo = curr.review.mpInfo
                let prev = data.reviews[index-1]
                if(mpShrink && prev && prev.review && prev.review.mpInfo
                    && prev.review.mpInfo.time === mpInfo.time){
                    tempEl.innerHTML = html
                    let lastEl = tempEl.querySelector('.webook_mp_item:last-child')!
                    let content = ''
                    if(!mpContent){
                        let contentEl = lastEl.querySelector('.mpContent')
                        if(contentEl) contentEl.remove()
                    } else if (mpInfo.content) {
                        content = `<div class='mpContent'>${mpInfo.content}</div>`
                    }
                    $(lastEl).append(
                        `<div class='mp-meta sametime'>
                            <div>
                                <a href="${mpInfo.doc_url}" class='mp-title' target="_blank">${mpInfo.title}</a>
                                ${content}
                            </div>
                            <div><img class='thumdnail' src="${mpInfo.pic_url}"/></div>
                        </div>`)
                    html = tempEl.innerHTML
                }else{
                    let content = ''
                    if(mpInfo.content) content = `<div class='mpContent'>${mpInfo.content}</div>`
                    html +=`<div class='createTime'>${timeConverter(mpInfo.time)}</div>
                            <div class='webook_mp_item'>
                                <div class='cover'><img src="${mpInfo.pic_url}"/></div>
                            <div class='mp-meta'>
                                <a href="${mpInfo.doc_url}" class='mp-title' target="_blank">${mpInfo.title}</a>
                                ${content}
                            </div>
                            </div>`
                }
            }
        })
        return html
    }
    /* 获取数据初始化内容 */
    chrome.runtime.sendMessage({type: "mpInit"}, (resp: {data: mpTypeJson, bookId: string}) => {
        let {data, bookId} = resp
        if (!data.reviews) return
        // favicon
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon'
            document.getElementsByTagName('head')[0].appendChild(link)
        }
        if(data.reviews[0].review.mpInfo.avatar){
            link.href = data.reviews[0].review.mpInfo.avatar
        }
        /* 公众号内容初始化 */
        document.title = data.reviews[0].review.mpInfo.mp_name
        chrome.storage.sync.get(function(sync){
            $('#webook_mp_list').html(getHtml(data, sync))
            $('#webook_mp_load_more').data('bookid', bookId)
            $('#webook_mp_load_more').data('offset', 10)
            $('#webook_mp_box').css('display', 'block')
		})
    })

    /* 公众号内容“加载更多”点击事件 */
    $('#webook_mp_load_more').on('click', function() {
        let bookId = $(this).data('bookid')
        let offset = $(this).data('offset')
        if (!bookId || !offset) return
        chrome.runtime.sendMessage({
            type:'mploadmore',
            bookId: bookId,
            offset: offset
        }, resp => {
            let {data} = resp
            if (!data.reviews || data.reviews.length == 0) {
                $('#webook_mp_load_more').remove()
                return alert('已加载全部')
            }
            chrome.storage.sync.get(function(sync){
                $('#webook_mp_list').append(getHtml(data, sync.mpShrink))
                let loadMore = $('#webook_mp_load_more')
                loadMore.data('bookid', bookId)
                loadMore.data('offset', Number.parseInt(offset)+10)
                if(loadMore.hasClass('loading')){
                    loadMore.removeClass('loading')
                }
            })
        })
    })
});

// 自动翻页
window.onscroll = function() {
    chrome.storage.sync.get((sync)=>{
        if(!sync.mpAutoLoad) return
        const scrollTop = $(this).scrollTop()!;
		const scrollHeight = $(document).height()!;
		const windowHeight = $(this).height()!;
        const positionValue = (scrollTop + windowHeight) - scrollHeight
        if (Math.abs(positionValue)<=0.9) {
            let loadMore = $('#webook_mp_load_more')
            if(!loadMore.hasClass('loading')){
                loadMore.trigger('click');
                loadMore.addClass('loading');
            }
        }
    })
}