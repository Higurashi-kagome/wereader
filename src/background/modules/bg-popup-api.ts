/* 将 popup 所需要用到的内容加入 window */

import { getTest } from './bg-dev';
import {
	copyBestBookMarks,
	copyBookMarks,
	copyComment,
	copyContents,
	copyThought,
	createMpPage,
	getShelfData,
	setBookId,
	setShelfData,
} from './bg-popup';
import {
	createTab,
	getUserVid,
	puzzling,
	sendMessageToContentScript,
} from './bg-utils';
import {
	Config,
	shelfForPopup,
} from './bg-vars';
import { Wereader } from './bg-wereader-api';

declare global{
	interface Window{
		popupApi: {[key: string]: any}
	}
}


export function initPopupApi() {
	window.popupApi = {};
	window.popupApi.Config = Config;
	window.popupApi.getTest = getTest;
	window.popupApi.setBookId = setBookId;
	window.popupApi.alert = alert;
	window.popupApi.getUserVid = getUserVid;
	window.popupApi.copyComment = copyComment;
	window.popupApi.copyContents = copyContents;
	window.popupApi.copyBookMarks = copyBookMarks;
	window.popupApi.copyBestBookMarks = copyBestBookMarks;
	window.popupApi.copyThought = copyThought;
	window.popupApi.sendMessageToContentScript = sendMessageToContentScript;
	window.popupApi.shelfForPopup = shelfForPopup;
	window.popupApi.getShelfData = getShelfData;
	window.popupApi.createTab = createTab;
	window.popupApi.setShelfData = setShelfData;
	window.popupApi.puzzling = puzzling;
	window.popupApi.createMpPage = createMpPage;
	window.popupApi.Wereader = Wereader;
}