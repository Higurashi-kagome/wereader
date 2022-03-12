// 书架刷新按钮点击事件
(function(){
	const shelfBtn = $('#shelfBtn');
	shelfBtn.html(shelfBtn.html() + `<span id='reload' title="刷新">&#x21bb;</span>`)
	$('#reload').click(async (e)=>{
		e.stopPropagation();
		$('#shelf').html(`<a>正在加载...</a>`);
		await bg.setShelfData();
		e.target.parentElement.click();
	});
})();