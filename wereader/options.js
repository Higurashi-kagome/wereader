//初始化
function initialize(){
    chrome.storage.sync.get(null, function(setting) {
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
        var allOptions = document.getElementById("add_number").options;
        if(setting.displayN == "true"){
            for (i=0; i<allOptions.length; i++){
                if (allOptions[i].id == "on"){
					allOptions[i].selected = true;
                }
            }
        }else{
            for (i=0; i<allOptions.length; i++){
                if (allOptions[i].id == "off"){
					allOptions[i].selected = true;
                }
            }
        }
    });
}

//初始化设置页
initialize();

function sendMsgToBg(msg){
    chrome.runtime.sendMessage(msg, function(response) {
    });
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
document.getElementById("add_number").onchange = function(){
    sendMsgToBg({set: true,displayN: "change"})
}
