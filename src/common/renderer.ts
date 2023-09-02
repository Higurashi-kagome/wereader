import * as nunjucks from 'nunjucks';
import { Sender } from './sender';
export class Renderer {
	constructor() {
		nunjucks.configure({autoescape: true})
	}

	validate(templateStr: string): boolean {
		try {
			nunjucks.renderString(templateStr, {});
			return true;
		} catch (error) {
			return false;
		}
	}

	async render(entry: object, templateStr = ''): Promise<string> {
		if (!templateStr) {
			const config = await new Sender('get-config').sendToWorker()
			templateStr = config.metaTemplate
		}
		const content = nunjucks.renderString(templateStr, {metaData: entry});
		return content;
	}
}
