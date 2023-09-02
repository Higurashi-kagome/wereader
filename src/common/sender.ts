import { SweetAlertOptions } from "sweetalert2"
import { getCurTab } from "../worker/worker-utils"
import { createOffset } from "../worker/worker-offscreen"

export class Sender{
	private _type: string
	private _data: any
	public static readonly worker = 'worker'
	public static readonly popup = 'popup'
	public static readonly offscreen = 'offscreen'
	public static readonly content = 'content'

	/**
	 * 构造消息发送对象
	 * @param type 消息类型
	 * @param data 消息数据
	 */
	constructor(type: string = '', data: any = undefined) {
		this._type = type
		this._data = data
	}

	public set type(type: string) {
		this.type = type
	}

	public set data(data: any) {
		this._data = data
	}

	async sendTo(target: string){
		return await chrome.runtime.sendMessage({target, type: this._type, data: this._data})
	}

	/**
	 * 发送消息到 worker
	 */
	async sendToWorker(){
		return await this.sendTo(Sender.worker)
	}

	/**
	 * 发送页面通知消息（发消息给 worker，worker 再发给 content）
	 * @param data 通知消息
	 */
	async sendAlertMsg(data: SweetAlertOptions = this._data){
		this._type = 'send-alert-msg'
		this._data = data
		return await this.sendTo(Sender.worker)
	}

	/**
	 * 发送消息到 popup
	 */
	async sendToPopup(){
		return await this.sendTo(Sender.popup)
	}

	/**
	 * 发送消息到 offscreen
	 */
	async sendToOffscreen(){
		return await this.sendTo(Sender.offscreen)
	}
	
	/**
	 * 发送消息到当前标签页的 content
	 */
	sendToContent(){
		getCurTab().then(tab=>{
			chrome.tabs.sendMessage(tab.id!, {target: Sender.content, type: this._type, data: this._data})
		})
	}
}