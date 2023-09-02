import { ConfigType } from "../worker/worker-vars";
import $ from 'jquery'
import { copy } from "./offscreen-utils";

/**
 * 解析右键菜单传来的内容并复制
 * @param data 包含待复制内容的数据
 * @param tab 发送消息的标签页
 * @param config 配置
 */
export async function onReceiveDom(data: {clickedEl: string, clickedElText: string}, tab: chrome.tabs.Tab, config: ConfigType) {
	// 在图标的右键菜单上点击将会报错，所以设置错误捕捉
	// 设置成 "contexts": ["page"] 无法处理图片被标注覆盖的情况
	if (chrome.runtime.lastError) return;
	let clickedEl
	let clickedElTagName
	try {
		clickedEl = $(data.clickedEl);
		clickedElTagName = clickedEl.prop("tagName").toLowerCase();
	} catch (error) {
		copy(`[${tab.title}](${tab.url})`)
		return
	}
	if (clickedElTagName == 'img')
	{	// 图片
		const src = clickedEl.attr('src');
		let alt = clickedEl.attr('alt');
		if (!alt && src) {
			const arr = src.split('/');
			if (arr.length) alt = arr[arr.length-1];
		}
		copy(`![${alt}](${src})`)
	}
	else if (clickedElTagName == 'pre')
	{	// 代码块
		const code = clickedEl.text();
		const mdText =  config.codePre + "\n" + code + config.codeSuf;
		copy(mdText)
	}
	else if (clickedEl.is('.reader_footerNote_text,.chapterItem_text'))
	{	// 脚注、目录
		copy(clickedEl.text())
	}
	else if (clickedEl.is('.content'))
	{	// 想法
		// let thought = clickedEl[0].outerText; // 不能正确换行，原因未知
		const thought = data.clickedElText;
		if (thought) copy(thought)
	}
	else if (clickedEl.is('.sectionListItem_content.noteItem_content,.text,.abstract'))
	{	// 标注、想法
		if (clickedEl.is('.noteItem_content_review'))
		{	// 如果同时包含想法和标注
			const thought = clickedEl.find('.text').text();
			const abstract = clickedEl.find('.abstract').text();
			const mdText = config.thouMarkPre + abstract + config.thouMarkSuf + '\n\n' + config.thouPre +  thought + config.thouSuf;
			copy(mdText)
		}
		else copy(clickedEl.text())
	}
	else
	{	// 标签页的 Markdown 链接
		copy(`[${tab.title}](${tab.url})`)
	}
}