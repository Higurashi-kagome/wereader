import { addToCurBook } from '../../worker/worker-vars'
import { bookmarksFilter } from '../debugger-filters'

export const onReceivedBookMarksResponse = async (body: any, detail: Map<string, any>) => {
    if (bookmarksFilter(detail.get('url'))) {
        console.log('onReceivedBookMarksResponse', body)
        await addToCurBook({ bookmarks: body })
        return true
    }
    return false
}
