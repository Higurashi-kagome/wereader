import { Sender } from '../../common/sender'
import {
    ShelfDataTypeJson,
    ShelfErrorDataType
} from '../../types/shelfTypes'
import { SweetAlertOptions } from 'sweetalert2'

export interface ShelfForPopupType{
    shelfData: ShelfDataTypeJson | ShelfErrorDataType
}

export class PopupApi {
    private sender = new Sender()

    async setBookId(): Promise<string> {
        this.sender.type = 'set-book-id'
        return this.sender.sendToWorker()
    }

    notify(msg: string) {
        this.sender.type = 'notify'
        this.sender.data = msg
        return this.sender.sendToWorker()
    }

    async getUserVid(): Promise<string> {
        this.sender.type = 'get-user-vid'
        return this.sender.sendToWorker()
    }

    copyComment(userVid: string, isAll: boolean) {
        this.sender.type = 'copy-comment'
        this.sender.data = { userVid, isAll }
        return this.sender.sendToWorker()
    }

    copyContents() {
        this.sender.type = 'copy-contents'
        return this.sender.sendToWorker()
    }

    copyBookMarks(isAll: boolean) {
        this.sender.type = 'copy-book-marks'
        this.sender.data = isAll
        return this.sender.sendToWorker()
    }

    copyBestBookMarks() {
        this.sender.type = 'copy-best-book-marks'
        return this.sender.sendToWorker()
    }

    copyThought(isAll: boolean) {
        this.sender.type = 'copy-thought'
        this.sender.data = isAll
        return this.sender.sendToWorker()
    }

    sendMessageToContentScript(data: object) {
        this.sender.type = 'send-message-to-content-script'
        this.sender.data = data
        return this.sender.sendToWorker()
    }

    sendAlertMsg (data: SweetAlertOptions) {
        this.sender.type = 'send-alert-msg'
        this.sender.data = data
        return this.sender.sendAlertMsg()
    }

    async shelfForPopup(): Promise<ShelfForPopupType> {
        this.sender.type = 'shelf-for-popup'
        return this.sender.sendToWorker()
    }

    async getShelfData(): Promise<ShelfDataTypeJson | ShelfErrorDataType> {
        this.sender.type = 'get-shelf-data'
        return this.sender.sendToWorker()
    }

    async createTab(data: object) {
        this.sender.type = 'create-tab'
        this.sender.data = data
        return this.sender.sendToWorker()
    }

    async setShelfData(data?: ShelfDataTypeJson | ShelfErrorDataType)
        : Promise<ShelfDataTypeJson | ShelfErrorDataType> {
        this.sender.type = 'set-shelf-data'
        this.sender.data = data
        return this.sender.sendToWorker()
    }

    async createMpPage(bookId: string) {
        this.sender.type = 'create-mp-page'
        this.sender.data = bookId
        return this.sender.sendToWorker()
    }

    copyBookInfo() {
        this.sender.type = 'copy-book-info'
        return this.sender.sendToWorker()
    }
}
