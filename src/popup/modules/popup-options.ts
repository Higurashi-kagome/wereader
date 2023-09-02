import $ from 'jquery';

import { popupApi } from './popup-utils';

// 选项页
async function initOptionsTab() {
	const config = await popupApi.Config()
	if(config.enableOption){
		const option = $(`<button class="tabLinks" id="openOption">选项</button>`);
		option.appendTo($('.tab')).on('click', ()=>{ chrome.runtime.openOptionsPage(); });
	}
}

export { initOptionsTab };