import $ from "jquery";
import { copy } from "./bg-utils";
import { Config } from "./bg-vars";

export function initRightClickMenu() {
	// 右键菜单：复制
	chrome.contextMenus.create({
		"title": "复制",
		"contexts": ["all"],
		"documentUrlPatterns": ["*://weread.qq.com/web/reader/*"],
		"onclick": rightClickEventListener
	});
}

// 右键复制
function rightClickEventListener(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
	// 获取 DOM 元素
	chrome.tabs.sendMessage(tab.id!, "getClickedEl", {frameId: info.frameId}, data => {
		// 在图标的右键菜单上点击将会报错，所以设置错误捕捉
		// 设置成 "contexts": ["page"] 无法处理图片被标注覆盖的情况
		if (chrome.runtime.lastError) return;
		let clickedEl = $(data.clickedEl);
		let clickedElTagName = clickedEl.prop("tagName").toLowerCase();
		if (clickedElTagName == 'img')
		{	// 图片
			let src = clickedEl.attr('src');
			let alt = clickedEl.attr('alt');
			if (!alt && src) {
				let arr = src.split('/');
				if (arr.length) alt = arr[arr.length-1];
			}
			let mdText = `![${alt}](${src})`;
			copy(mdText);
		}
		else if (clickedElTagName == 'pre')
		{	// 代码块
			let code = clickedEl.text();
			let mdText =  Config.codePre + "\n" + code + Config.codeSuf;
			copy(mdText);
		}
		else if (clickedEl.is('.reader_footerNote_text,.chapterItem_text'))
		{	// 脚注、目录
			copy(clickedEl.text());
		}
		else if (clickedEl.is('.content'))
		{	// 想法
			// let thought = clickedEl[0].outerText; // 不能正确换行，原因未知
			let thought = data.clickedElText;
			if (thought) copy(thought);
		}
		else if (clickedEl.is('.sectionListItem_content.noteItem_content,.text,.abstract'))
		{	// 标注、想法
			if (clickedEl.is('.noteItem_content_review'))
			{	// 如果同时包含想法和标注
				let thought = clickedEl.find('.text').text();
				let abstract = clickedEl.find('.abstract').text();
				let mdText = Config.thouMarkPre + abstract + Config.thouMarkSuf + '\n\n' + Config.thouPre +  thought + Config.thouSuf;
				copy(mdText);
			}
			else copy(clickedEl.text());
		}
		else
		{	// 标签页的 Markdown 链接
			let {url, title} = tab;
			let mdText = `[${title}](${url})`;
			copy(mdText);
		}
	});
}