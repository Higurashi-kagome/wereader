import $ from "jquery";
/* 全部展开 */
function initExpandBtn() {
	let expandAllButton = $("#expandAllButton")
	expandAllButton.on('click', function(){
		if (expandAllButton.attr('class')) {
			expandAllButton.removeClass();
		} else {
			expandAllButton.addClass("opened")
		}
		document.querySelectorAll("details").forEach(
			detailElement => detailElement.open = Boolean(expandAllButton.attr('class'))
		)
	})
}

export {initExpandBtn};