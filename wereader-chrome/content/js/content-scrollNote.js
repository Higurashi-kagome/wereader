
document.querySelector('.note').addEventListener('click',function(){
    let currentContent = ''
    //获取当前目录
    if(document.getElementsByClassName("readerTopBar_title_chapter")[0]){
        currentContent = document.getElementsByClassName("readerTopBar_title_chapter")[0].textContent
    }else{
        currentContent = document.getElementsByClassName("chapterItem chapterItem_current")[0].childNodes[0].childNodes[0].textContent
    }
    //替换开头空格
    currentContent = currentContent.replace(/^\s*([\s\S]*)/,"$1")
    let item_title = document.getElementsByClassName('sectionListItem_title');
    for (let i = 0; i < item_title.length; i++) {
        const element = item_title[i];
        if(element.textContent == currentContent){
            //太早滚动无效，所以设置定时
            setTimeout(() => {
                element.parentElement.scrollIntoView({behavior: "smooth"})
            }, 1000);
        }
    }
},false)