$(".tab").after(`<input type="text" id="searchBookInput" style="width: -webkit-fill-available; font-style: italic; font-size: 13px; padding: 10px 17px 10px 17px; border: 1px solid #ddd; " placeholder="搜索...">`);    
$('#searchBookInput').keyup(function (e) {
	let input = $(this);
	let filter = input.val().toUpperCase();
	$(".dropdown-container > a").each((index, el)=>{
		let a = $(el);
		let text = a.text().toUpperCase();
		if (text.indexOf(filter) > -1) {
			a.css('display', 'block');
		} else {
			a.css('display', 'none');
		}
	});
});