import $ from 'jquery'

import { tabClickEvent } from './popup-tabs'

// 捐助页
async function initDonateTab() {
    // 创建爱心标签页按钮
    const donateBtn = $('<button class="tabLinks" id="donateBtn">❤️</button>')
    donateBtn.appendTo($('.tab')).on('click', tabClickEvent)

    // 创建捐助内容区域
    const donateContent = $(`
        <div class="tabContent vertical-menu" data-for="donateBtn" id="donateContent" style="display: none;">
            <div style="text-align: center; padding: 20px;">
                <h3 style="margin-bottom: 20px; color: #e74c3c;">感谢您的支持！</h3>
                <p style="margin-bottom: 20px; color: #666;">如果这个扩展对您有帮助，欢迎捐助支持开发</p>

                <div style="display: flex; justify-content: space-around; margin-top: 30px;">
                    <div style="text-align: center;">
                        <h4 style="color: #27ae60; margin-bottom: 10px;">微信捐助</h4>
                        <div id="wechatQR" style="width: 120px; height: 120px; margin: 0 auto; background: #f8f9fa; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: #999;">
                            <img src="./icons/donate/wxpay.png" style="width: 100%; height: 100%; object-fit: contain;" alt="微信二维码">
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <h4 style="color: #3498db; margin-bottom: 10px;">支付宝捐助</h4>
                        <div id="alipayQR" style="width: 120px; height: 120px; margin: 0 auto; background: #f8f9fa; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; color: #999;">
                            <img src="./icons/donate/aliplay.png" style="width: 100%; height: 100%; object-fit: contain;" alt="支付宝二维码">
                        </div>
                    </div>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                    您的每一份支持都是作者继续开发的动力 ❤️
                </p>
            </div>
        </div>
    `)

    donateContent.appendTo($('body'))
}

export { initDonateTab }
