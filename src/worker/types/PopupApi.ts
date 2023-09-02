import { getSyncStorage } from '../../common/utils'
import {
	ShelfDataTypeJson,
	ShelfErrorDataType,
} from '../../types/shelfTypes'
import { ConfigType } from './ConfigType'

export interface ShelfForPopupType{
	shelfData: ShelfDataTypeJson | ShelfErrorDataType
}

export class PopupApi {
	async Config(): Promise<ConfigType> {
		return await getSyncStorage(null) as ConfigType
	}
	async setBookId(): Promise<string> {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'set-book-id'})
	}
	notify(msg: string) {
		chrome.runtime.sendMessage({target: 'worker', type: 'notify', data: msg})
	}
	async getUserVid(): Promise<string> {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'get-user-vid'})
	}
	copyComment(userVid: string, isAll: boolean) {
		chrome.runtime.sendMessage({target: 'worker', type: 'copy-comment', data: {userVid, isAll}})
	}
	copyContents() {
		chrome.runtime.sendMessage({target: 'worker', type: 'copy-contents'})
	}
	copyBookMarks(isAll: boolean) {
		chrome.runtime.sendMessage({target: 'worker', type: 'copy-book-marks', data: isAll})
	}
	copyBestBookMarks() {
		chrome.runtime.sendMessage({target: 'worker', type: 'copy-best-book-marks'})
	}
	copyThought(isAll: boolean) {
		chrome.runtime.sendMessage({target: 'worker', type: 'copy-thought', data: isAll})
	}
	sendMessageToContentScript(data: object) {
		chrome.runtime.sendMessage({target: 'worker', type: 'send-message-to-content-script', data})
	}
	async shelfForPopup(): Promise<ShelfForPopupType> {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'shelf-for-popup'})
	}
	async getShelfData(): Promise<ShelfDataTypeJson | ShelfErrorDataType> {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'get-shelf-data'})
	}
	async createTab(data: object) {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'create-tab', data})
	}
	async setShelfData(data?: ShelfDataTypeJson | ShelfErrorDataType): Promise<ShelfDataTypeJson | ShelfErrorDataType> {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'set-shelf-data', data})
	}
	async createMpPage(bookId: string) {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'create-mp-page', data: bookId})
	}
	copyBookInfo() {
		chrome.runtime.sendMessage({target: 'worker', type: 'copy-book-info'})
	}
}