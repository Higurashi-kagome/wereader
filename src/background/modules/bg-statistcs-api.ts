import { getReadDetail } from './bg-popup';
import { Wereader } from './bg-wereader-api';

declare global{
	interface Window{
		statisticsApi: {[key: string]: any}
	}
}


export function initStatisticsApi() {
	window.statisticsApi = {};
	window.statisticsApi.getReadDetail = getReadDetail;
	window.statisticsApi.Wereader = Wereader;
}