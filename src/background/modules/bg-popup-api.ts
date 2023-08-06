/* 将 popup 所需要用到的内容加入 window */

import {
	ShelfDataTypeJson,
	ShelfErrorDataType,
} from '../../types/shelfTypes';
import { getTest } from './bg-dev';
import {
	copyBestBookMarks,
	copyBookMarks,
	copyComment,
	copyContents,
	copyThought,
	createMpPage,
	copyBookInfo,
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
	ConfigType,
} from './bg-vars';
import { Wereader } from './bg-wereader-api';

export interface ShelfForPopupType{
	shelfData: ShelfDataTypeJson | ShelfErrorDataType
}
let shelfForPopup: ShelfForPopupType = { shelfData: {} };

export interface PopupApi {
	Config: ConfigType;
	getTest: Function;
	setBookId: Function;
	alert: Function;
	getUserVid: Function;
	copyComment: Function;
	copyContents: Function;
	copyBookMarks: Function;
	copyBestBookMarks: Function;
	copyThought: Function;
	sendMessageToContentScript: Function;
	shelfForPopup: ShelfForPopupType;
	getShelfData: Function;
	createTab: Function;
	setShelfData: Function;
	puzzling: Function;
	createMpPage: Function;
	copyBookInfo: Function;
	Wereader: typeof Wereader;
}

declare global{
	interface Window{
		popupApi: PopupApi
	}
}


export function initPopupApi() {
	window.popupApi = {} as PopupApi;
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
	window.popupApi.copyBookInfo = copyBookInfo;
	window.popupApi.Wereader = Wereader;
}