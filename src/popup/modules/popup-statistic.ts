import $ from 'jquery'
import { getSyncStorage } from '../../common/utils'
import { ConfigType } from '../../worker/worker-vars'

// 统计按钮点击事件
async function initStatisticsTab() {
    let statistic = $('#statisticBtn')
    const config = await getSyncStorage() as ConfigType
    if (config.enableStatistics) {
    // 新创建
        if (!statistic.length) {
            statistic = $('<button class="tabLinks" id="statisticBtn">统计</button>')
            statistic.appendTo('.tab').on('click', () => {
                chrome.tabs.create({ url: chrome.runtime.getURL('statistics.html') })
            })
        }
    } else {
        statistic.hide()
    }
}

export { initStatisticsTab }
