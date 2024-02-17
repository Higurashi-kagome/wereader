import { addToCurBook } from '../../worker/worker-vars'
import { reviewFilter } from '../debugger-filters'

export const onReceivedReviewResponse = async (body: any, detail: Map<string, any>) => {
    if (reviewFilter(detail.get('url'))) {
        console.log('onReceivedReviewResponse', body)
        await addToCurBook({ review: body })
        return true
    }
    return false
}
