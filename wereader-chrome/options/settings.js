/* 初始化设置备份页面settings.html */

//返回json长度
function getJsonLength(jsonData) {
    var length = 0;
    for(var ever in jsonData) {
        length++;
    }
    return length;
}

const key = "backup"
chrome.storage.local.get([key], function(settings) {
    console.log("chrome.storage.local.get([\"backup\"],function(settings){\nconsole.log(settings)\n})")
    console.log(settings)
    //显示“无备份”
    function noBackup(){
        d = document.getElementById("settingList")
        elem = document.createElement("p")
        elem.innerHTML = "无备份"
        d.appendChild(elem)
    }
    if(getJsonLength(settings) == 0 || getJsonLength(settings[key]) == 0){
        //无备份则显示“无备份”
        noBackup()
    }else{
        //有备份则列出备份
        var i = 0
        var div = document.getElementById("settingList")
        for(let k in settings[key]){
            let setting = settings[key][k]
            //设置备份名
            setting["backupName"] = k
            //容器
            let elem1 = document.createElement("div")
            //"导入"、"删除"
            let elem2 = document.createElement("input")
            elem2.type = "button"
            elem2.value = "导入"
            elem2.style.cssFloat = "right"
            let elem3 = document.createElement("input")
            elem3.type = "button"
            elem3.value = "删除"
            elem3.style.cssFloat = "right"
            //名字
            let elem4 = document.createElement("lable")
            elem4.id = "setting" + i
            elem4.textContent = k
            //分隔
            let elem5 = document.createElement("div")
            elem5.className = "blank"
            elem5.style.margin = "10px"
            //导入按钮点击事件
            elem2.onclick = function(){
                chrome.storage.sync.set(setting, function() {
                    window.location.href = "options.html"
                })
            }
            //删除按钮点击事件
            elem3.onclick = function(){
                delete settings[key][k]
                parent = this.parentNode
                chrome.storage.local.set(settings, function() {
                    parent.style.display = "none"
                    if(getJsonLength(settings[key]) == 0){
                        noBackup()
                    }
                })
            }
            elem1.appendChild(elem4)
            elem1.appendChild(elem2)
            elem1.appendChild(elem3)
            div.appendChild(elem1)
            div.appendChild(elem5)
            i = i + 1
        }
    }
})