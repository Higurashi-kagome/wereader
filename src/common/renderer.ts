import * as nunjucks from 'nunjucks';
import { Config } from '../background/modules/bg-vars';
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

	render(entry: object, templateStr = Config.metaTemplate): string {
		const content = nunjucks.renderString(templateStr, {metaData: entry});
		return content;
	}
}
