/* 设置页 */
/* chrome.storage.local.clear(function(){

}) */
/* chrome.storage.local.get(["backup"],function(settings){
    console.log(settings)
}) */
//备份
function backup(){
    //初始化备份命名提示
    function ini(settings){
        var container = document.getElementById("inputName")
        var aInput = document.getElementById("name")
        var submit = document.getElementById("submit")
        var cancle = document.getElementById("cancel")
        //"确定"
        submit.onclick = function(){
            if(aInput.value == ""){
                aInput.placeholder = "请输入备份名..."
            }else if(settings[key][aInput.value] != undefined){
                aInput.value = ""
                aInput.placeholder = "重名，请重新输入..."
            }else{
                chrome.storage.sync.get(null, function(setting) {
                    settings[key][aInput.value] = setting
                    chrome.storage.local.set(settings,function(){
                        aInput.value = ""
                        container.style.display = "none"
                    })
                })
            }
        }
        //"取消"
        cancle.onclick = function(){
            container.style.display = "none"
        }
        container.style.display = "block"
    }
    var key = "backup"
    chrome.storage.local.get([key], function(settings) {
        //检查是否有备份
        if(settings[key] == undefined){
            settings[key] = {}
            chrome.storage.local.set(settings,function(){
                ini(settings)
            })
        }else{
            ini(settings)
        }
    })
}

//更新已启用正则匹配
function updateCheckedRegexp(){
    var checkBoxCollection = document.getElementsByClassName("contextMenuEnabledInput")
    var checkedRegexp = {checkedRe:[]}
    for(var i = 0,len = checkBoxCollection.length;i < len;i++){
        if(checkBoxCollection[i].checked == true){
            let parent = checkBoxCollection[i].parentNode
            let id = checkBoxCollection[i].id
            let re = parent.getElementsByClassName("regexp")[0].value
            let pre = parent.getElementsByClassName("regexp_pre")[0].value
            let suf = parent.getElementsByClassName("regexp_suf")[0].value
            if(re != ""){
                checkedRegexp.checkedRe.push([id,re,pre,suf])
            }
        }
    }
    chrome.storage.sync.set(checkedRegexp,function(){

    })
}

//更新所有正则
function updateRegexp(){
    var regexpContainer = document.getElementsByClassName("regexp_container")
    var Regexp = {re:[]}
    for(var i = 0,len = regexpContainer.length;i < len;i++){
        let id = regexpContainer[i].getElementsByClassName("contextMenuEnabledInput")[0].id
        let re = regexpContainer[i].getElementsByClassName("regexp")[0].value
        let pre = regexpContainer[i].getElementsByClassName("regexp_pre")[0].value
        let suf = regexpContainer[i].getElementsByClassName("regexp_suf")[0].value
        Regexp.re.push([id,re,pre,suf])
    }
    chrome.storage.sync.set(Regexp,function(){
        
    })
}

//发消息通知后台
function sendMsgToBg(msg){
    chrome.runtime.sendMessage(msg);
}

//初始化
function initialize(){
    document.getElementById("backup").onclick = backup
    chrome.storage.sync.get(null, function(setting) {
        console.log("chrome.storage.sync.get(null,function(setting){\nconsole.log(setting)\n})")
        console.log(setting)
        var keys = ["s1Pre","s1Suf","s2Pre","s2Suf","s3Pre","s3Suf","lev1","lev2","lev3","thouPre","thouSuf"]
        //处理未定义的情况
        var all = keys.concat(["displayN","checkedRe","codePre","codeSuf","preLang","re"])
        var config = {}
        for(var i=0,len=all.length;i<len;i++){
            key = all[i]
            if(setting[key] == undefined){
                config[key] = ""
            }           
        }
        chrome.storage.sync.set(config,function(){

        })
        //"标注、标题、想法" 初始化
        for(var i=0,len=keys.length;i<len;i++){
            var key = keys[i]
            document.getElementById(key).value = setting[key]
            document.getElementById(key).onchange = function(){
                sendMsgToBg({set: true, type: this.id, text: this.value})
            }
        }
        //"是否显示热门标注人数" 初始化
        (setting.displayN == "true") ? (document.getElementById("add_number").checked = true)
         : (document.getElementById("add_number").checked = false)
        document.getElementById("add_number").onclick = function(){
            sendMsgToBg({set: true, type: "switchAddNumber"})
        }
        //"代码块"初始化
        var keys = ["codePre","codeSuf","preLang"]
        for(var i=0,len=keys.length;i<len;i++){
            key = keys[i]
            config = {}
            if(setting[key] == undefined){
                config[key] =  (key == "preLang") ? "" : "```"
                chrome.storage.sync.set(config,function(){
                    document.getElementById(key).value = config[key]
                })
            }else{
                document.getElementById(key).value = setting[key]
            }
            document.getElementById(key).onchange = function(){
                config[this.id] = this.value
                chrome.storage.sync.set(config,function(){
                    
                })
            }
        }
        /************************************************************************************/
        //正则匹配初始化
        var checkBoxCollection = document.getElementsByClassName("contextMenuEnabledInput")
        var checkedRe = setting.checkedRe
        //checkbox 初始化
        if(checkedRe != undefined && checkedRe.length >= 0 && checkedRe.length <= 5){
            for(var i = 0,len1 = checkBoxCollection.length;i < len1;i++){
                for(var j = 0,len2 = checkedRe.length;j < len2;j++){
                    if(checkedRe[j][0] == checkBoxCollection[i].id){
                        checkBoxCollection[i].checked = true
                        let parent = checkBoxCollection[i].parentNode
                        parent.getElementsByClassName("regexp")[0].value = checkedRe[j][1]
                        parent.getElementsByClassName("regexp_pre")[0].value = checkedRe[j][2]
                        parent.getElementsByClassName("regexp_suf")[0].value = checkedRe[j][3]
                    }
                }
            }
        }
        //正则表达式 checkbox 点击事件
        for(var i = 0,len = checkBoxCollection.length;i < len;i++){
            checkBoxCollection[i].onclick = function(){
                if(this.parentNode.getElementsByClassName("regexp")[0].value != ""){
                    updateCheckedRegexp()
                }
            }
        }
        //正则表达式 input、textarea 初始化
        var regexpContainer = document.getElementsByClassName("regexp_container")
        var reCollection = setting.re
        if(reCollection != undefined && reCollection.length == 5){
            for(var i = 0,len = reCollection.length;i<len;i++){
                regexpContainer[i].getElementsByClassName("regexp")[0].value = reCollection[i][1]
                regexpContainer[i].getElementsByClassName("regexp_pre")[0].value = reCollection[i][2]
                regexpContainer[i].getElementsByClassName("regexp_suf")[0].value = reCollection[i][3]
            }
        }else{
            updateRegexp()
        }
        //正则表达式 input、textarea 改变
        for(var i = 0,len1 = regexpContainer.length;i < len1;i++){
            var classNameArr = ["regexp","regexp_pre","regexp_suf"]
            for(var j=0,len2=classNameArr.length;j<len2;j++){
                regexpContainer[i].getElementsByClassName(classNameArr[j])[0].onchange = function(){
                    updateRegexp()
                    updateCheckedRegexp()
                }
            }
        }
    });
}

//初始化设置页
initialize();

//设置更多的正则表达式（暂时不添加此功能）
/* 
//加号点击事件
document.getElementById("addRegExp").onclick = function(){
    var regexpContainer = document.getElementsByClassName("regexp_container")
    var len = regexpContainer.length
    if(len > 0 && len <= 10){
        var parent = regexpContainer[0].parentNode
        var newRegexpContainer = regexpContainer[len - 1].cloneNode(true)
        //更新id
        var checkBox = newRegexpContainer.getElementsByClassName("contextMenuEnabledInput")[0]
        var id = checkBox.id
        checkBox.id = id.substr(0,id.length - 1) + (parseInt(id.substr(id.length - 1)) + 1)
        var inser = parent.insertBefore(newRegexpContainer,this.parentNode)
        inser.getElementsByClassName("regexp")[0].value = ""
        inser.getElementsByClassName("regexp_pre")[0].value = ""
        inser.getElementsByClassName("regexp_suf")[0].value = ""
        checkBox.onclick = function(){
            updateCheckedRegexp()
        }
    }else if(len > 10){
        //alert("最多添加10个")
    }
}

//减号点击事件
document.getElementById("removeRegExp").onclick = function(){
    var regexpContainer = document.getElementsByClassName("regexp_container")
    var len = regexpContainer.length
    if(len > 1){
        var lastRegexpContainer = regexpContainer[len - 1]
        lastRegexpContainer.parentNode.removeChild(lastRegexpContainer)
    }
} */