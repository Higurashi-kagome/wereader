function timeConverter(UNIX_timestamp){
    const zeroPad = (num, places) => String(num).padStart(places, '0')
    var a = new Date(UNIX_timestamp * 1000)
    var year = a.getFullYear()
    var month = zeroPad(a.getMonth()+1, 2)
    var day = zeroPad(a.getDate(), 2)
    var hour = zeroPad(a.getHours(), 2)
    var min = zeroPad(a.getMinutes(), 2)
    var sec = zeroPad(a.getSeconds(), 2)
    return `${year}.${month}.${day} ${hour}:${min}`
}

$(document).ready(function(){
    /* 插入容器 */
    let _mpBox = $(`
        <div id="webook_mp_scroll">
            <div>
                <div id="webook_mp_list">
                </div>
                <div id="webook_mp_load_more">加载更多</div>
            </div>
        </div>
    `)
    $('body').append(_mpBox)

    /* 获取数据初始化内容 */
    chrome.runtime.sendMessage({type: "mpInit"}, resp => {
        /* 公众号内容初始化 */
        let {data, bookId} = resp;
        if (!data.reviews) return;
        document.title = data.reviews[0].review.mpInfo.mp_name;
        let _html = ''
        data.reviews.forEach(function(each) {
            if (each.review && each.review.mpInfo) {
                let mpInfo = each.review.mpInfo
                _html += `
                    <div>
                        <div>
                            <img src="${mpInfo.pic_url}"/>
                        </div>
                        <div>
                            <a href="${mpInfo.doc_url}" target="_blank">${mpInfo.title}</a>
                            <div>${timeConverter(mpInfo.time)}</div>
                        </div>
                    </div>
                `
            }
        })
        $('#webook_mp_list').html(_html)
        $('#webook_mp_load_more').data('bookid', bookId)
        $('#webook_mp_load_more').data('offset', 10)
        $('#webook_mp_box').css('display', 'block')
    });

    /* 公众号内容“加载更多”点击事件 */
    $('#webook_mp_load_more').on('click', function() {
        let bookId = $(this).data('bookid')
        let offset = $(this).data('offset')
        if (!bookId || !offset) return;
        chrome.runtime.sendMessage({
            type:'mploadmore',
            bookId: bookId,
            offset: offset
        }, resp => {
            let {data} = resp;
            if (!data.reviews || data.reviews.length == 0) {
                return alert('已加载全部');
            }
            let _html = '';
            data.reviews.forEach(function(each) {
                if (each.review && each.review.mpInfo) {
                    let mpInfo = each.review.mpInfo
                    _html += `
                        <div><div><img src="${mpInfo.pic_url}"/></div><div><a href="${mpInfo.doc_url}" target="_blank">${mpInfo.title}</a><div>${timeConverter(mpInfo.time)}</div></div></div>
                    `
                }
            })
            $('#webook_mp_list').append(_html)
            let loadMore = $('#webook_mp_load_more');
            loadMore.data('bookid', bookId)
            loadMore.data('offset', Number.parseInt(offset)+10)
            if(loadMore.hasClass('loading')){
                loadMore.removeClass('loading')
            }
        });
    });
    
})


$(window).scroll(function() {
    chrome.storage.sync.get(function(sync){
        if(!sync.mpAutoLoad) return;
        var scrollTop = $(this).scrollTop(),scrollHeight = $(document).height(),windowHeight = $(this).height();
        var positionValue = (scrollTop + windowHeight) - scrollHeight;
        if (Math.abs(positionValue)<=0.9) {
            let loadMore = $('#webook_mp_load_more');
            if(!loadMore.hasClass('loading')){
                loadMore.click();
                loadMore.addClass('loading');
            }
        }
    });
});