
document.querySelector('.note').addEventListener('click',function(){
	if (document.getElementById('sectionListItem_title_scroll')) return;
	// #noteTools 在 searchNote 中创建
	let btn = $(`<button
	style='font-size: 16px;padding: 12px 20px 12px 40px;border:1px groove; border-bottom: none; text-align: left;'>目录</button>`).prependTo('#noteTools');
	let ul = $(`<ul id='sectionListItem_title_scroll'></ul>`).prependTo('#noteTools');
	$('.sectionListItem_title').each((idx, el)=>{
		let li = $(`<li><a>${el.innerText}</a></li>`).click(()=>{
			el.parentElement.scrollIntoView({behavior: "smooth"});
			ul.toggle();
		});
		ul.append(li);
	});
	btn.click(()=>{
		$('#sectionListItem_title_scroll').toggle();
	});
},false);