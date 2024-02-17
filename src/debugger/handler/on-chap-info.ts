import { addToCurBook } from '../../worker/worker-vars'
import { chapInfoFilter } from '../debugger-filters'

export const onReceivedChapInfoResponse = async (body: any, detail: Map<string, any>) => {
    if (chapInfoFilter(detail.get('url'))) {
        console.log('onReceivedChapInfoResponse', body)
        await addToCurBook({ chapInfo: body })
        return true
    }
    return false
}
