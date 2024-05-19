const BACKUPKEY = 'backup'
const BACKUPNAME = 'backupName'
const DEFAULT_BACKUPNAME = '默认设置'
const STORAGE_ERRORMSG = '存储出错'
// "标注、标题、想法、代码块" input id
const InputIds = ['s1Pre', 's1Suf', 's2Pre', 's2Suf', 's3Pre', 's3Suf', 'lev1Pre', 'lev1Suf', 'lev2Pre', 'lev2Suf', 'lev3Pre', 'lev3Suf',
    'thouPre', 'thouSuf', 'metaTemplate', 'footSupTemp', 'footNoteTemp', 'thouMarkPre', 'thouMarkSuf', 'codePre', 'codeSuf', 'imgTag', 'scale']
// "其他" CheckBox id
const CheckBoxIds = [
    'displayN', 'mpShrink', 'mpContent', 'mpAutoLoad', 'addThoughts', 'thoughtFirst',
    'enableDevelop', 'distinctThouMarks', 'allTitles', 'anchorTitle', 'enableShelf',
    'enableStatistics', 'enableOption', 'enableFancybox', 'enableCopyImgs', 'enableThoughtEsc'
]
const RegexpInputClassName = 'regexpInput'

export {
    BACKUPKEY,
    BACKUPNAME,
    CheckBoxIds,
    DEFAULT_BACKUPNAME,
    InputIds,
    RegexpInputClassName,
    STORAGE_ERRORMSG
}
