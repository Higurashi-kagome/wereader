//初始化
function initialize(){
    chrome.runtime.sendMessage({getSetting: true}, function(response) {
        console.log('收到来自后台的回复：' + response);
        document.getElementById("first_level_pre").value = response.s1Pre;
        document.getElementById("first_level_suf").value = response.s1Suf;
        document.getElementById("second_level_pre").value = response.s2Pre;
        document.getElementById("second_level_suf").value = response.s2Suf;
        document.getElementById("third_level_pre").value = response.s3Pre;
        document.getElementById("third_level_suf").value = response.s3Suf;
        document.getElementById("first_header").value = response.lev1;
        document.getElementById("second_header").value = response.lev2;
        document.getElementById("third_header").value = response.lev3;
        document.getElementById("thought_pre").value = response.thouPre;
        document.getElementById("thought_suf").value = response.thouSuf;
        var allOptions = document.getElementById("add_number").options;
        if(response.displayN == "true"){
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

//改变则发消息到后台
function sendMessage(id){
    switch(id){
        case "first_level_pre":
            chrome.runtime.sendMessage({set: true, s1Pre: document.getElementById("first_level_pre").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "first_level_suf":
            chrome.runtime.sendMessage({set: true, s1Suf: document.getElementById("first_level_suf").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "second_level_pre":
            chrome.runtime.sendMessage({set: true, s2Pre: document.getElementById("second_level_pre").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "second_level_suf":
            chrome.runtime.sendMessage({set: true, s2Suf: document.getElementById("second_level_suf").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "third_level_pre":
            chrome.runtime.sendMessage({set: true, s3Pre: document.getElementById("third_level_pre").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "third_level_suf":
            chrome.runtime.sendMessage({set: true, s3Pre: document.getElementById("first_level_suf").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "first_header":
            chrome.runtime.sendMessage({set: true, lev1: document.getElementById("first_header").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "second_header":
            chrome.runtime.sendMessage({set: true, lev2: document.getElementById("second_header").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "third_header":
            chrome.runtime.sendMessage({set: true, lev3: document.getElementById("third_header").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "thought_pre":
            chrome.runtime.sendMessage({set: true, thouPre: document.getElementById("thought_pre").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "thought_suf":
            chrome.runtime.sendMessage({set: true, thouSuf: document.getElementById("thought_suf").value}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
        case "add_number":
            chrome.runtime.sendMessage({set: true,displayN: "change"}, function(response) {
                console.log('收到来自后台的回复：' + response);
            });
            break;
    }
}

//初始化
initialize();

//设置监听
document.getElementById("first_level_pre").onchange = function(){
    sendMessage("first_level_pre")
}
document.getElementById("first_level_suf").onchange = function(){
    sendMessage("first_level_suf")
}
document.getElementById("second_level_pre").onchange = function(){
    sendMessage("second_level_pre")
}
document.getElementById("second_level_suf").onchange = function(){
    sendMessage("second_level_suf")
}
document.getElementById("third_level_pre").onchange = function(){
    sendMessage("third_level_pre")
}
document.getElementById("third_level_suf").onchange = function(){
    sendMessage("third_level_suf")
}
document.getElementById("first_header").onchange = function(){
    sendMessage("first_header")
}
document.getElementById("second_header").onchange = function(){
    sendMessage("second_header")
}
document.getElementById("third_header").onchange = function(){
    sendMessage("third_header")
}
document.getElementById("thought_pre").onchange = function(){
    sendMessage("thought_pre")
}
document.getElementById("thought_suf").onchange = function(){
    sendMessage("thought_suf")
}
document.getElementById("add_number").onchange = function(){
    sendMessage("add_number")
}
