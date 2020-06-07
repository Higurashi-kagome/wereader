//用于获取书本目录
console.log("inject-contents.js被注入了");
var contentElement = document.getElementsByClassName("readerCatalog_list")[0];
var childs = contentElement.childNodes;
var childsLength = childs.length;
var texts = [];
for (var i = 0; i < childsLength; i++){
    var classname = childs[i].childNodes[0].className;
    var level = classname.charAt(classname.length - 1);
    var innerHtml = childs[i].childNodes[0].childNodes[0].innerHTML;
    texts.push(level + innerHtml);
}
//传消息给后台
chrome.runtime.sendMessage({getContents: true, contents: texts}, function(response) {
	console.log('收到来自后台的回复：' + response);
});