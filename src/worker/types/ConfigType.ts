import { reConfigCollectionType } from '../../options/options-utils'

// 用于检查格式并保存当前配置
export interface ConfigType {
    s1Pre: string;
    s1Suf: string;
    s2Pre: string;
    s2Suf: string;
    s3Pre: string;
    s3Suf: string;
    imgTag: string;
    scale: string;
    lev1Pre: string;
    lev1Suf: string;
    lev2Pre: string;
    lev2Suf: string;
    lev3Pre: string;
    lev3Suf: string;
    thouPre: string;
    thouSuf: string;
    metaTemplate: string;
    thouMarkPre: string;
    thouMarkSuf: string;
    codePre: string;
    codeSuf: string;
    displayN: boolean;
    mpShrink: boolean;
    mpContent: boolean;
    mpAutoLoad: boolean;
    allTitles: boolean;
    addThoughts: boolean;
    thoughtFirst: boolean;
    enableDevelop: boolean;
    distinctThouMarks: boolean;
    enableStatistics: boolean;
    enableOption: boolean;
    enableCopyImgs: boolean;
    enableFancybox: boolean;
    enableThoughtEsc: boolean;
    backupName: string;
    selectAction: string;
    thoughtTextOptions: string;
    // 如果不设置默认值，则在设置页初始化时需要考虑到
    re: reConfigCollectionType;
    flag: 0;
    footSupTemp: string;
    footNoteTemp: string;
    [key: string]: unknown;
}
