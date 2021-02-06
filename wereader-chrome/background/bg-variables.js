var bookId = "null"//用于记录当前读书页的 bookId
var importBookId = "null"//用于记录导入书籍的 bookId
const DefaultBackupName = "默认设置"
const StorageErrorMsg = "存储出错"
const BackupKey = "backup"
//保存图片Markdown文本的数组
var markedData = []
//用于记录 popup 是否请求复制目录
var isCopyContent = false
const DefaultRegexPattern = {replacePattern:'',checked:false}

//用于检查格式并保存当前配置
var Config = {
    s1Pre: "",
    s1Suf: "",
    s2Pre: "**",
    s2Suf: "**",
    s3Pre: "",
    s3Suf: "",
    lev1: "## ",
    lev2: "### ",
    lev3: "#### ",
    thouPre: "==",
    thouSuf: "==",
    thouMarkPre: "> ",
    thouMarkSuf: "",
    codePre: "```",
    codeSuf: "```",
    displayN: false,
    addThoughts: false,
    enableRightClick: true,
    backupName: DefaultBackupName,
    selectAction: "underlinNone",
    //如果不设置默认值，则在设置页初始化时需要考虑到 
    re: {re1:DefaultRegexPattern,re2:DefaultRegexPattern,re3:DefaultRegexPattern,re4:DefaultRegexPattern,re5:DefaultRegexPattern},
    flag: 0
}