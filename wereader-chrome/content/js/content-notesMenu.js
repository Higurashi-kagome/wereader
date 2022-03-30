
document.querySelector('.note').addEventListener('click',function(){
	const curChapTitle = window.getCurrentChapTitle();
	const title_scroll_selector = '#sectionListItem_title_scroll';
	// 已经创建
	if ($(title_scroll_selector).length) {
		// 删除之前章节标注
		$(`${title_scroll_selector} a.current`).removeClass('current');
		// 标记当前章节
		$(`${title_scroll_selector} a`).each((idx, el)=>{
			let title = $(el);
			if (title.text() == curChapTitle) title.addClass('current');
		})
		return;
	}
	// 开始创建
	let btn = $(`<button class='notesMenuBtn'>目录</button>`).prependTo('#noteTools'); // #noteTools 在 searchNote 中创建
	let ul = $(`<ul id='${title_scroll_selector.replace("#", "")}'></ul>`).prependTo('#noteTools');
	$('.sectionListItem_title').each((idx, el)=>{
		// 标记当前章节
		const titleText = el.innerText;
		const className = (titleText == curChapTitle) ? 'current' : '';
		// 生成目录
		let li = $(`<li><a class='${className}'>${titleText}</a></li>`).click(()=>{
			// 标题被搜索框排除时也能够跳转
			let elParent = $(el.parentElement);
			let isHide = elParent.css('display') == 'none';
			if (isHide) elParent.css('display', 'block');
			el.parentElement.scrollIntoView({behavior: "smooth"});
			if (isHide) elParent.css('display', 'none');
			ul.toggle();
		});
		ul.append(li);
	});
	btn.click(()=>{
		$(title_scroll_selector).toggle();
	});
},false);