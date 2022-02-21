document.querySelector('.note').addEventListener('click',function(){
	if (document.getElementById('searchNoteInput')) return;
	$(".readerNotePanel").prepend(`<input type="text" id="searchNoteInput" style="font-size: 16px;padding: 12px 20px 12px 40px;border: 1px solid #ddd; " placeholder="搜索...">`);
	$('#searchNoteInput').keyup(function (e) {
		let input = $(this);
		let filter = input.val().toUpperCase();
		$(".sectionListItem").each((index, el)=>{
			let div = $(el);
			let text = div.find("div.text").text().toUpperCase();
			let abstract = div.find("div.abstract").text().toUpperCase();
			let title = div.find('div.sectionListItem_title').text();
			if (text.indexOf(filter) > -1 || abstract.indexOf(filter) > -1 || title.indexOf(filter) > -1) {
				div.css('display', 'block');
			} else {
				div.css('display', 'none');
			}
		})
	});
});