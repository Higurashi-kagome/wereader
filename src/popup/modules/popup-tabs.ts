import $ from "jquery";

/**
 * 绑定 tab 按钮点击事件
 */
function initTabClick() {
	// tab 按钮点击事件，默认打开第一个 tab
	$('.tabLinks').on('click', function tabClickEvent() {
		// 隐藏 .tabContent
		$('.tabContent').hide();
		// 去除处于 active 状态的 .tabLinks 元素
		$('.tabLinks').removeClass('active');
		// 显示当前 tab 内容
		$(`.tabContent[data-for='${$(this).attr('id')}']`).show();
		// 将当前 tab 按钮设置为 active
		$(this).addClass('active');
	});
}

export {initTabClick};