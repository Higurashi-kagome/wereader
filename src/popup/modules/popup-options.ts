import $ from 'jquery';

import { bg } from './popup-utils';

// 选项页
function initOptionsTab() {
	if(bg.Config.enableOption){
		const option = $(`<button class="tabLinks" id="openOption">选项</button>`);
		option.appendTo($('.tab')).on('click', ()=>{ chrome.runtime.openOptionsPage(); });
	}
}

export { initOptionsTab };