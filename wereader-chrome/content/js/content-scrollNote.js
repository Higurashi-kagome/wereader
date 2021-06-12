
document.querySelector('.note').addEventListener('click',function(){
    let currentChapTitle = window.getCurrentChapTitle();
    let item_title = document.getElementsByClassName('sectionListItem_title');
    for (let i = 0; i < item_title.length; i++) {
        const element = item_title[i];
        if(element.textContent == currentChapTitle){
            //太早滚动无效，所以设置定时
            setTimeout(() => {
                element.parentElement.scrollIntoView({behavior: "smooth"})
            }, 1000);
        }
    }
},false);