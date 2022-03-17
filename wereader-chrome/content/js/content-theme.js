/* 主要用于实现阅读页主题色切换，另外还负责从 content-scroll.js 中调用函数帮助实现进度*/

//console.log("inject-theme.js：被注入")
//添加主题切换按钮并绑定点击事件
function addThemeBtn(){
	// 创建
    let theme = $(`<button title='主题' class='readerControls_item theme'></button>`);
    theme.append($('<span>主题</span>'));
    $('.readerControls_item.white,.readerControls_item.dark').css('display', 'none').before(theme);
	// 点击事件
    theme.click(()=>{
        try{
            changeTheme(); Flag = Flag + 1;
        }catch (error) {
            Swal.fire({title: "Oops...",text: "似乎出了点问题，刷新一下试试吧~",icon: "error",confirmButtonText: 'OK'});
        }
    });
    
    //改变主题
    function changeTheme(){
        //如果当前主题为夜色模式
        if($('.readerControls_item.white').length){
            //设置白色主题
            Flag=-1
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/white.css"})
            $('.readerControls_item.white').click();
        }else if(Flag == 0){
            //设置绿色主题
            if($('.readerControls_item.white').length){
                $('.readerControls_item.white').click();
            }
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/green.css"})
        }else if(Flag == 1){
            //设置橙色主题
            if($('.readerControls_item.white').length){
                $('.readerControls_item.white').click();
            }
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/orange.css"})
        }else if(Flag == 2){
            //设置黑色主题
            chrome.runtime.sendMessage({type: "injectCss", css: "theme/dark.css"})
            $('.readerControls_item.dark').click();
        }
        //保存当前主题对应编号
        chrome.storage.sync.set({flag: Flag},function(){
            if(chrome.runtime.lastError)alert("存储出错")
        })
    }
}

var Flag = 0;
// 主题初始化（记住上次设置的背景主题）
$(document).arrive('.readerControls_item', {onceOnly: true}, ()=>{
	chrome.storage.sync.get(['flag'], function(result) {
		if(result.flag === 0){
			//设置绿色主题
			$('.readerControls_item.white').click();
			chrome.runtime.sendMessage({type: "injectCss", css: "theme/green.css"})
			// 绿色的下一个为橙色（1）
			Flag = 1
		}else if(result.flag === 1){
			//设置橙色主题
			$('.readerControls_item.white').click();
			chrome.runtime.sendMessage({type: "injectCss", css: "theme/orange.css"})
			// 橙色的下一个为黑色（2）
			Flag = 2
		}else if(result.flag === 2){
			// 设置黑色主题
			chrome.runtime.sendMessage({type: "injectCss", css: "theme/dark.css"});
			$('.readerControls_item.dark').click();
		} else if(result.flag === -1){
			// 设置白色主题
			chrome.runtime.sendMessage({type: "injectCss", css: "theme/white.css"});
			$('.readerControls_item.white').click();
		}
	});
});

// 添加按钮
window.addEventListener('load', ()=>{
    // 主题切换按钮
    const themeSwitch = document.querySelectorAll(".readerControls_item.white,.readerControls_item.dark")[0];
    if(themeSwitch != undefined && themeSwitch.style.display != "none") addThemeBtn();
});