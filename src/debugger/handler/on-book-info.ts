import { addToCurBook } from '../../worker/worker-vars'
import { bookInfoFilter } from '../debugger-filters'

export const onReceivedBookInfoResponse = async (body: any, detail: Map<string, any>) => {
    if (bookInfoFilter(detail.get('url'))) {
        await addToCurBook({ bookInfo: body })
        return true
    }
    return false
}
