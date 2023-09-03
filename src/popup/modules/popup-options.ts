import $ from 'jquery'

import { getConfig } from '../../common/utils'

// 选项页
async function initOptionsTab() {
    const config = await getConfig()
    if (config.enableOption) {
        const option = $('<button class="tabLinks" id="openOption">选项</button>')
        option.appendTo($('.tab')).on('click', () => { chrome.runtime.openOptionsPage() })
    }
}

export { initOptionsTab }
