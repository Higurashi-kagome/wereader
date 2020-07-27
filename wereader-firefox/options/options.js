//更新已启用正则匹配
function updateCheckedRegexp(){
    console.log("updateCheckedRegexp()：被调用")
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
    console.log("updateCheckedRegexp()：checkedRegexp：\n" + JSON.stringify(checkedRegexp))
    chrome.storage.sync.set(checkedRegexp,function(){
        console.log("updateCheckedRegexp()：\"已启用\"正则匹配更新结束")
    })
    console.log("updateCheckedRegexp()：结束")
}

//更新所有正则
function updateRegexp(){
    console.log("updateRegexp()：被调用")
    var regexpContainer = document.getElementsByClassName("regexp_container")
    var Regexp = {re:[]}
    for(var i = 0,len = regexpContainer.length;i < len;i++){
        let id = regexpContainer[i].getElementsByClassName("contextMenuEnabledInput")[0].id
        let re = regexpContainer[i].getElementsByClassName("regexp")[0].value
        let pre = regexpContainer[i].getElementsByClassName("regexp_pre")[0].value
        let suf = regexpContainer[i].getElementsByClassName("regexp_suf")[0].value
        Regexp.re.push([id,re,pre,suf])
    }
    console.log("updateRegexp()：Regexp：\n" + JSON.stringify(Regexp))
    chrome.storage.sync.set(Regexp,function(){
        console.log("updateRegexp()：\"所有\"正则匹配更新结束")
    })
    console.log("updateRegexp()：结束")
}

//初始化
 function initialize(){
    console.log("initialize()：被调用")
    chrome.storage.sync.get(null, function(setting) {
        console.log("initialize()：chrome.storage.sync.get()：获取到数据")
        console.log("基础初始化开始")
        document.getElementById("first_level_pre").value = setting.s1Pre;
        document.getElementById("first_level_suf").value = setting.s1Suf;
        document.getElementById("second_level_pre").value = setting.s2Pre;
        document.getElementById("second_level_suf").value = setting.s2Suf;
        document.getElementById("third_level_pre").value = setting.s3Pre;
        document.getElementById("third_level_suf").value = setting.s3Suf;
        document.getElementById("first_header").value = setting.lev1;
        document.getElementById("second_header").value = setting.lev2;
        document.getElementById("third_header").value = setting.lev3;
        document.getElementById("thought_pre").value = setting.thouPre;
        document.getElementById("thought_suf").value = setting.thouSuf;
        (setting.displayN == "true") ? (document.getElementById("add_number").checked = true)
         : (document.getElementById("add_number").checked = false)
        console.log("基础初始化结束")
        /************************************************************************************/
        console.log("正则匹配初始化开始")
        var checkBoxCollection = document.getElementsByClassName("contextMenuEnabledInput")
        var checkedRe = setting.checkedRe
        console.log("已选中正则：\n" + JSON.stringify(checkedRe))
        //checkbox初始化
        console.log("checkbox初始化开始")
        if(checkedRe != undefined && checkedRe.length > 0 && checkedRe.length <= 5){
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
        }else if(checkedRe != undefined){
            console.log("ERROR：initialize()：setting.checkedRe：" + JSON.stringify(checkedRe))
        }
        //checkbox点击事件
        for(var i = 0,len = checkBoxCollection.length;i < len;i++){
            checkBoxCollection[i].onclick = function(){
                if(this.parentNode.getElementsByClassName("regexp")[0].value != ""){
                    updateCheckedRegexp()
                }
            }
        }
        console.log("checkbox初始化结束")
        //input、textarea初始化
        console.log("input、textarea初始化开始")
        var regexpContainer = document.getElementsByClassName("regexp_container")
        var reCollection = setting.re
        console.log("全部正则：\n" + JSON.stringify(reCollection))
        if(reCollection != undefined && reCollection.length == 5){
            for(var i = 0,len = reCollection.length;i<len;i++){
                regexpContainer[i].getElementsByClassName("regexp")[0].value = reCollection[i][1]
                regexpContainer[i].getElementsByClassName("regexp_pre")[0].value = reCollection[i][2]
                regexpContainer[i].getElementsByClassName("regexp_suf")[0].value = reCollection[i][3]
            }
        }else{
            updateRegexp()
        }
        //input、textarea改变
        for(var i = 0,len = regexpContainer.length;i < len;i++){
            regexpContainer[i].getElementsByClassName("regexp")[0].onchange = function(){
                updateRegexp()
                updateCheckedRegexp()
            }
            regexpContainer[i].getElementsByClassName("regexp_pre")[0].onchange = function(){
                updateRegexp()
                updateCheckedRegexp()
            }
            regexpContainer[i].getElementsByClassName("regexp_suf")[0].onchange = function(){
                updateRegexp()
                updateCheckedRegexp()
            }
        }
        console.log("input、textarea初始化结束")
        console.log("正则匹配初始化结束")
        console.log("initialize()：chrome.storage.sync.get()：结束")
    });
    console.log("initialize()：结束")
}

//初始化设置页
initialize();

function sendMsgToBg(msg){
    chrome.runtime.sendMessage(msg);
}

//监听设置页，更改设置则发送消息到后台
document.getElementById("first_level_pre").onchange = function(){
    sendMsgToBg({set: true, s1Pre: document.getElementById("first_level_pre").value})
}
document.getElementById("first_level_suf").onchange = function(){
    sendMsgToBg({set: true, s1Suf: document.getElementById("first_level_suf").value})
}
document.getElementById("second_level_pre").onchange = function(){
    sendMsgToBg({set: true, s2Pre: document.getElementById("second_level_pre").value})
}
document.getElementById("second_level_suf").onchange = function(){
    sendMsgToBg({set: true, s2Suf: document.getElementById("second_level_suf").value})
}
document.getElementById("third_level_pre").onchange = function(){
    sendMsgToBg({set: true, s3Pre: document.getElementById("third_level_pre").value})
}
document.getElementById("third_level_suf").onchange = function(){
    sendMsgToBg({set: true, s3Pre: document.getElementById("first_level_suf").value})
}
document.getElementById("first_header").onchange = function(){
    sendMsgToBg({set: true, lev1: document.getElementById("first_header").value})
}
document.getElementById("second_header").onchange = function(){
    sendMsgToBg({set: true, lev2: document.getElementById("second_header").value})
}
document.getElementById("third_header").onchange = function(){
    sendMsgToBg({set: true, lev3: document.getElementById("third_header").value})
}
document.getElementById("thought_pre").onchange = function(){
    sendMsgToBg({set: true, thouPre: document.getElementById("thought_pre").value})
}
document.getElementById("thought_suf").onchange = function(){
    sendMsgToBg({set: true, thouSuf: document.getElementById("thought_suf").value})
}
document.getElementById("add_number").onclick = function(){
    sendMsgToBg({set: true,displayN: "change"})
}

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