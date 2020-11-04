/*通知为导入书籍或读书页中存在代码块时的注意点*/

//console.log("content-notice.js：被注入")
var interval_notice = setInterval(() => {
    //如果页面不再显示正在加载（确保页面加载完毕）
    if (document.getElementsByClassName("readerChapterContentLoading").length == 0) {
        /* 不直接在inject-bid.js中通知是因为inject-bid.js在导入书籍页会分别在两个时间点被注入，最终导致通知两次 */
        //为导入书籍
		let list = document.getElementsByClassName("wr_bookCover_img").item(0).src.split("/")
		let bid = list[list.length - 2]
		if(bid == "wrepub"){
			Swal.fire({
				title:"导入书籍", 
				html:"<p align=left>检测到该书为导入书籍，如无法正常导出内容，请刷新页面后重试~</p>",
				confirmButtonText: 'OK'
			})
        }
        //含代码块
        if(document.getElementsByTagName("pre").length > 0){
            Swal.fire({
                title:"代码块", 
                html:"<p align=left>检测到该书中包含代码块，因为种种原因，请不要在网页版微信读书上单独标注代码块，因为在网页中标注的代码块不能够被正常导出，且有可能导致你无法正常导出本章标注中被单独标注的图片（如果你的本章标注内容中包含被单独标注的图片的话）。如果想导出代码块内容：<br>一、可以在手机上对代码内容进行标注，<br>二、可以借助“开启复制按钮”功能手动复制。</p>",
                confirmButtonText: 'OK'
            })
        }
        //结束定时器
        clearInterval(interval_notice)
    }
},2000)