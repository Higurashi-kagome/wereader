import { Sender } from '../../common/sender'
import { readDetailJson } from '../../types/readDetailTypes'

export class StatApi {
    private sender = new Sender()

    async getReadDetail(monthTimestamp?: number, type = 1, count = 3): Promise<readDetailJson> {
        this.sender.type = 'get-read-detail'
        this.sender.data = { type, count, monthTimestamp }
        return this.sender.sendToWorker()
    }
}
