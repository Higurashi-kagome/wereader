/* 声明全局变量 */
var bookId = undefined;
var bookIds = {};
const DefaultBackupName = "默认设置"
const StorageErrorMsg = "存储出错"
const BackupKey = "backup";
let shelfForPopup = {shelfData: undefined, shelfHtml: undefined};
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
    allTitles: false,
    addThoughts: false,
    enableRightClick: true,
    enableDevelop: false,
    backupName: DefaultBackupName,
    selectAction: "underlinNone",
    //如果不设置默认值，则在设置页初始化时需要考虑到 
    re: {re1:DefaultRegexPattern,re2:DefaultRegexPattern,re3:DefaultRegexPattern,re4:DefaultRegexPattern,re5:DefaultRegexPattern},
    flag: 0
}

class Wereader{
    constructor(bookId, userVid){
        const url = `https://i.weread.qq.com`;
        this.wereadMainUrl = `https://weread.qq.com`;
        this.chapInfosUrl = `${url}/book/chapterInfos?bookIds=${bookId}&synckeys=0`;
        this.bookmarksUrl = `${url}/book/bookmarklist?bookId=${bookId}`;
        this.bestBookmarksUrl = `${url}/book/bestbookmarks?bookId=${bookId}`;
        this.thoughtsUrl = `${url}/review/list?bookId=${bookId}&listType=11&mine=1&synckey=0&listMode=0`;
        this.commentsUrl = `${url}/review/list?listType=6&userVid=${userVid}&rangeType=2&mine=1&listMode=1`;
        this.shelfDataUrl = `${this.wereadMainUrl}/web/shelf/sync?userVid=${userVid}&synckey=0&lectureSynckey=0`;
        this.removeBookmarkUrl = `${this.wereadMainUrl}/web/book/removeBookmark`;
        this.readDetailUrl = `${url}/readdetail?`;
    }

    async getBookmarks(){
		let data = await getJson(this.bookmarksUrl);
        return data;
    }

    async getChapInfos(){
		let data = await getJson(this.chapInfosUrl);
        return data;
    }

    async getBestBookmarks(){
        let data = await getJson(this.bestBookmarksUrl);
        return data;
    }

    async getThoughts(){
        let data = await getJson(this.thoughtsUrl);
        return data;
    }

    async getComments(){
        let data = await getJson(this.commentsUrl);
        return data;
    }

    async getShelfData(){
        let data = await getJson(this.shelfDataUrl);
        return data;
    }

    async removeBookmarkById(bookmarkId){
        const resp = await fetch(this.removeBookmarkUrl, {
            method: 'POST',
            body: JSON.stringify({bookmarkId: bookmarkId}),
            headers: {'Content-Type': 'application/json'},
			credentials: "include",
			Cache: 'no-cache'
        });
        const respJson = await resp.json();
        return respJson;
    }
    
    async removeBookmarks(chapterUid){
        const data = await this.getBookmarks();
        let bookmarks, succ = 0, fail = 0;
        console.log(chapterUid !== undefined);
        if(chapterUid === undefined){
            bookmarks = data.updated;
        }else{
            bookmarks = data.updated.filter(mark=>{return mark.chapterUid == chapterUid;});
        }
        for (const mark of bookmarks) {
            let respJson = {};
            try {
                respJson = await this.removeBookmarkById(mark.bookmarkId);
            } catch (error) {
                fail++;
                continue;
            }
            if(!respJson.succ) fail++;
            else succ++;
        }
        return {succ: succ, fail: fail}
    }

    async getReadDetail(type=1, count=3, monthTimestamp){
        /**
         * 本年月数据及去年年总结：https://i.weread.qq.com/readdetail 
         * 指定月及该月之前指定数量的月数据：https://i.weread.qq.com/readdetail?baseTimestamp=1612108800&count=3&type=1
         * type=1：获取月数据
         * type=0：获取周数据
         */
        let url = this.readDetailUrl;
        if(monthTimestamp) url = `${url}&baseTimestamp=${monthTimestamp}`;
        if(count) url = `${url}&count=${count}`;
        if([0,1].indexOf(type)>-1) url = `${url}&type=${type}`;
        const respJson = await getJson(url);
        return respJson;
    }

    async isLogined(){
        let text = await getText(this.wereadMainUrl);
        if(text.indexOf('wr_avatar_img')>-1) return true;
        else return false;
    }
}