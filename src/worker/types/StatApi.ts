import { readDetailJson } from '../../types/readDetailTypes';

export class StatApi {
	async getReadDetail(type=1, count=3, monthTimestamp?: number): Promise<readDetailJson> {
		return await chrome.runtime.sendMessage({target: 'worker', type: 'get-read-detail', data: {type, count, monthTimestamp}})
	}
}