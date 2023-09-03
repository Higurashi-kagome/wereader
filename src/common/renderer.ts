import * as nunjucks from 'nunjucks'
import { Sender } from './sender'
export class Renderer {
    private templateStr = ''

    constructor(templateStr: string = '') {
        this.templateStr = templateStr
        nunjucks.configure({ autoescape: true })
    }

    validate(templateStr: string = this.templateStr): boolean {
        try {
            nunjucks.renderString(templateStr, {})
            return true
        } catch (error) {
            return false
        }
    }

    async render(entry: object, templateStr = this.templateStr): Promise<string> {
        if (!templateStr) {
            const config = await new Sender('get-config').sendToWorker()
            templateStr = config.metaTemplate
        }
        const content = nunjucks.renderString(templateStr, { metaData: entry })
        return content
    }
}
