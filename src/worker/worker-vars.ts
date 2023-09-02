import { IMG_TAG } from '../common/constants';
import { getLocalStorage } from '../common/utils';
import { ConfigType } from './types/ConfigType';

export {
	BackupKey,
	defaultConfig,
	ConfigType,
	DefaultBackupName,
	DefaultRegexPattern,
	StorageErrorMsg,
};
const DefaultBackupName = "默认设置";
const StorageErrorMsg = "存储出错";
const BackupKey = "backup";
const DefaultRegexPattern = {replacePattern: '', checked: false};

// "想法所对应文本被标注时保留"选项
export enum ThoughtTextOptions{
	JustThought = "thoughtTextThought",
	All = "thoughtTextAll",
	JustMark = "thoughtTextMark"
}

// "选中后动作"选项
export enum SelectActionOptions{
	None = "underlineNone",
	Copy = "copy",
	Bg = "underlineBg",
	Straight = "underlineStraight",
	HandWrite = "underlineHandWrite"
}

var defaultConfig: ConfigType = {
    s1Pre: "",
    s1Suf: "",
    s2Pre: "**",
    s2Suf: "**",
    s3Pre: "",
    s3Suf: "",
    imgTag: IMG_TAG,
	scale: '0.97',
    lev1Pre: "## ",
    lev1Suf: "",
    lev2Pre: "### ",
    lev2Suf: "",
    lev3Pre: "#### ",
    lev3Suf: "",
    thouPre: "==",
    thouSuf: "==",
	metaTemplate: `__metaTemplate__`,
    thouMarkPre: "> ",
    thouMarkSuf: "",
    codePre: "```",
    codeSuf: "```",
    displayN: false,
    mpShrink: false,
    mpContent: false,
    mpAutoLoad: true,
    allTitles: false,
    addThoughts: true,
	thoughtFirst: false,
    enableDevelop: false,
	distinctThouMarks: true,
    enableStatistics: false,
    enableOption: true,
	enableCopyImgs: true,
    enableFancybox: true,
	enableThoughtEsc: true,
    backupName: DefaultBackupName,
    selectAction: SelectActionOptions.None,
	thoughtTextOptions: ThoughtTextOptions.JustThought,
    //如果不设置默认值，则在设置页初始化时需要考虑到 
    re: {re1:DefaultRegexPattern,re2:DefaultRegexPattern,re3:DefaultRegexPattern,re4:DefaultRegexPattern,re5:DefaultRegexPattern},
    flag: 0
}
/**
 * 获取当前读书页的书本 id
 * @returns 当前读书页的书本 id
 */
export async function getBookId(): Promise<string> {
	return await getLocalStorage('bookId')
}
/**
 * 获取已打开读书页及对应书本 id
 * @returns tabId: bookId 键值对
 */
export async function getBookIds(): Promise<{[key: number]: any}> {
	return await getLocalStorage('bookIds')
}

/**
 * 初始化 bookIds
 */
export async function initBookIds() {
	return await chrome.storage.local.set({bookIds: {}})
}