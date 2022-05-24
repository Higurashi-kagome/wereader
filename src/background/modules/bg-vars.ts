import { reConfigCollectionType } from '../../options/options-utils';

export {
	BackupKey,
	bookIds,
	Config,
	ConfigType,
	DefaultBackupName,
	DefaultRegexPattern,
	isCopyContent,
	mpTempData,
	StorageErrorMsg,
};

// 给 window 添加全局变量
declare global {
	interface Window {
		bookId: string | undefined
	}
}

/* 声明全局变量 */
// 当前读书页的书本 id
window.bookId = undefined;
// 所有已打开读书页的书本 id
var bookIds = new Map<number, string>();
const DefaultBackupName = "默认设置";
const StorageErrorMsg = "存储出错";
const BackupKey = "backup";
//用于记录 popup 是否请求复制目录
var isCopyContent = false;
const DefaultRegexPattern = {replacePattern: '', checked: false};
var mpTempData: {[bookId: string]: any[]} = {};

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

//用于检查格式并保存当前配置
interface ConfigType{
	s1Pre: string,
    s1Suf: string,
    s2Pre: string,
    s2Suf: string,
    s3Pre: string,
    s3Suf: string,
    lev1Pre: string,
    lev1Suf: string,
    lev2Pre: string,
    lev2Suf: string,
    lev3Pre: string,
    lev3Suf: string,
    thouPre: string,
    thouSuf: string,
    thouMarkPre: string,
    thouMarkSuf: string,
    codePre: string,
    codeSuf: string,
    displayN: boolean,
    mpShrink: boolean,
    mpContent: boolean,
    mpAutoLoad: boolean,
    allTitles: boolean,
    addThoughts: boolean,
	thoughtFirst: boolean,
    enableDevelop: boolean,
    enableStatistics: boolean,
    enableOption: boolean,
	enableCopyImgs: boolean,
    enableFancybox: boolean,
	enableThoughtEsc: boolean,
    backupName: string,
    selectAction: string,
    thoughtTextOptions: string,
    //如果不设置默认值，则在设置页初始化时需要考虑到 
    re: reConfigCollectionType,
    flag: 0,
	[key: string]: any
}

var Config: ConfigType = {
    s1Pre: "",
    s1Suf: "",
    s2Pre: "**",
    s2Suf: "**",
    s3Pre: "",
    s3Suf: "",
    lev1Pre: "## ",
    lev1Suf: "",
    lev2Pre: "### ",
    lev2Suf: "",
    lev3Pre: "#### ",
    lev3Suf: "",
    thouPre: "==",
    thouSuf: "==",
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