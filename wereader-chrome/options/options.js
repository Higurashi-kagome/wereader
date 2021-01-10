/* 设置页 */
//初始化设置页
initialize()

//报错捕捉函数
function catchErr(sender) {
	if (chrome.runtime.lastError) {
        console.log(sender + " => chrome.runtime.lastError：\n" + chrome.runtime.lastError.message)
        return true
	}else{
        return false
    }
}

//设置属性
function setAttributes(element,attributes){
	for(let key in attributes){
		if(Object.prototype.toString.call(attributes[key]) === '[object Object]'){
			setAttributes(element[key],attributes[key])
		}else{
			element[key] = attributes[key]
		}
	}
}

// 新建设置
function addProfile(){
    chrome.storage.local.get(function(settings){
        let promptContainer = document.getElementById("promptContainer")
        document.getElementById("promptLabel").textContent = "请输入这个新的配置文件名"
        let input = document.getElementById("promptInput")
        //"确定"
        document.getElementById("promptConfirmButton").onclick = function(){
            let profileName = input.value
            if(profileName == ""){//未输入
                input.placeholder = "请输入配置名"
            }else if(settings[BACKUPKEY][profileName] != undefined){//键值在local中存在
                setAttributes(input,{value:"",placeholder:"该配置名已存在，请重新输入"})
            }else{
                //在local中新建设置（以sync中的数据为值）
                chrome.storage.sync.get(function(setting) {
                    settings[BACKUPKEY][profileName] = setting
                    setting[BACKUPNAME] = profileName
                    updateStorageArea({setting:setting,settings:settings},function(){
                        promptContainer.style.display = "none"
                        setAttributes(input,{value:"",placeholder:""})
                        initialize()
                    })
                })
            }
        }
        promptContainer.style.display = "block"
        input.focus()
    })
}

//删除设置
function deleteProfile(){
    let confirmContainer = document.getElementById("confirmContainer")
    document.getElementById("confirmLabel").textContent = "请确认是否移除所选配置文件"
    let confirmLabel = document.getElementById("confirmLabel")
    //确认
    document.getElementById("confirmButton").onclick = function(){
        //删除local数据
        chrome.storage.local.get(function(settings){
            let currentSelect = document.getElementById("profileNamesInput").value
            if(currentSelect == DEFAULT_BACKUPNAME)return
            delete settings[BACKUPKEY][currentSelect]
            let setting = settings[BACKUPKEY][DEFAULT_BACKUPNAME]//设置sync为默认
            setting[BACKUPNAME] = DEFAULT_BACKUPNAME
            updateStorageArea({setting:setting,settings:settings},function(){
                confirmLabel.textContent = ""
                confirmContainer.style.display = "none"
                initialize()
            })
        })
    }
    //取消
    document.getElementById("cancelButton").onclick = function(){
        confirmLabel.textContent = ""
        confirmContainer.style.display = "none"
    }
    confirmContainer.style.display = "block"
}

//重命名设置
function renameProfile(){
    let promptContainer = document.getElementById("promptContainer")
    document.getElementById("promptLabel").textContent = "请为所选配置文件输入新的名称"
    let input = document.getElementById("promptInput")
    //确认
    document.getElementById("promptConfirmButton").onclick = function(){
        //修改local数据
        chrome.storage.local.get(function(settings){
            if(input.value == ""){
                input.placeholder = "请输入新的名称"
            }else if(settings[BACKUPKEY][input.value] != undefined){
                setAttributes(input,{value:"",placeholder:"该配置名已存在，请重新输入"})
            }else{
                let currentSelect = document.getElementById("profileNamesInput").value
                let profile = settings[BACKUPKEY][currentSelect]
                let profileName = input.value
                delete settings[BACKUPKEY][currentSelect]
                settings[BACKUPKEY][profileName] = profile
                let setting = profile
                setting[BACKUPNAME] = profileName
                updateStorageArea({setting:setting,settings:settings},function(){
                    promptContainer.style.display = "none"
                    setAttributes(input,{value:"",placeholder:""})
                    initialize()
                })
            }
        })
    }
    promptContainer.style.display = "block"
    input.focus()
}

//更新sync和local
function updateStorageArea(configMsg={},callback=function(){}){
    //存在异步问题，故设置用于处理短时间内需要进行多次设置的情况
    if(configMsg.setting && configMsg.settings){
        chrome.storage.sync.set(configMsg.setting,function(){
            if(catchErr("updateSyncAndLocal"))alert(STORAGE_ERRORMSG)
            chrome.storage.local.set(configMsg.settings,function(){
                if(catchErr("updateSyncAndLocal"))alert(STORAGE_ERRORMSG)
                callback()
            })  
        })
    }else if(configMsg.key && configMsg.value){
        let config = {}
        let key = configMsg.key
        let value = configMsg.value
        config[key] = value
        chrome.storage.sync.set(config,function(){
            if(catchErr("updateSyncAndLocal"))alert(STORAGE_ERRORMSG)
            chrome.storage.local.get(function(settings){
                const currentProfile = document.getElementById("profileNamesInput").value
                settings[BACKUPKEY][currentProfile][key] = value
                chrome.storage.local.set(settings,function(){
                    if(catchErr("updateSyncAndLocal"))alert(STORAGE_ERRORMSG)
                    callback()
                })
            })
        })
    }
}

//从页面获取正则设置
function getRegexpSet(){
    const checkedRexpKey = "checkedRe"
    const regexpKey = "re"
    let checkedRegexpValue = []
    let regexpValue = []
    let checkBoxCollection = document.getElementsByClassName("contextMenuEnabledInput")
    for(let i = 0;i < checkBoxCollection.length;i++){
        let parent = checkBoxCollection[i].parentNode.parentNode
        let id = checkBoxCollection[i].id
        let re = parent.getElementsByClassName("regexp")[0].value
        let pre = parent.getElementsByClassName("regexp_pre")[0].value
        let suf = parent.getElementsByClassName("regexp_suf")[0].value
        let regexpData = [id,re,pre,suf]
        regexpValue.push(regexpData)
        if(checkBoxCollection[i].checked && re != ""){//获取已启用正则数据
            checkedRegexpValue.push(regexpData)
        }
    }
    return {allRegexp:{key:regexpKey,value:regexpValue},checkedRegexp:{key:checkedRexpKey,value:checkedRegexpValue}}
}

//更新正则
function updateRegexp(){
    const regexpSet = getRegexpSet()
    updateStorageArea(regexpSet.allRegexp,function(){//更新全部正则
        updateStorageArea(regexpSet.checkedRegexp)//更新已启用正则
    })
}

//初始化一般选项
function initializeBasic(){
    /* 帮助按钮点击事件 */
    let helpIcons = document.getElementsByClassName("help-icon")
    let helpContents = document.getElementsByClassName("help-content")
    for (let index = 0; index < helpIcons.length; index++) {
        helpIcons[index].onclick = function(){
            helpContents[index].hidden = !helpContents[index].hidden
            return false
        }
    }
    /* 全部展开 */
    let expandAllButton = document.getElementById("expandAllButton")
    expandAllButton.onclick = function(){
		if (expandAllButton.className) {
			expandAllButton.className = ""
		} else {
			expandAllButton.className = "opened"
		}
		document.querySelectorAll("details").forEach(detailElement => detailElement.open = Boolean(expandAllButton.className))
    }
    /* prompt 弹窗初始化 */
    let input = document.getElementById("promptInput")
    //prompt 取消
    document.getElementById("promptCancelButton").onclick = function(){
        setAttributes(input,{value:"",placeholder:""})
        document.getElementById("promptContainer").style.display = "none"
    }
    //prompt 回车确定
    input.onkeyup = event => {
        if (event.code == "Enter") {
            document.getElementById("promptConfirmButton").click()
            return false
        }
    }
}

//初始化
function initialize(){
    initializeBasic()
    /************************************************************************************/
    chrome.storage.sync.get(function(setting) {
        console.log("chrome.storage.sync.get(function(setting){\nconsole.log(setting)\n})")
        console.log(setting)
        /************************************************************************************/
        /* 配置选项初始化 */
        chrome.storage.local.get(function(settings){
            console.log("chrome.storage.local.get(function(settings){\nconsole.log(settings)\n})")
            console.log(settings)
            console.log("********************************************")
            let profileNamesInput = document.getElementById("profileNamesInput")
            //先清空select列表
            profileNamesInput.options.length = 0
            //各配置添加到select列表
            for(let key in settings[BACKUPKEY]){
                let option = document.createElement("option")
                option.text = key
                if(key == DEFAULT_BACKUPNAME){
                    profileNamesInput.add(option,profileNamesInput.options[0])//默认设置放第一位
                }else{
                    profileNamesInput.add(option,null)
                }
            }
            //选中当前配置
            let currentProfile = setting[BACKUPNAME]
            if(settings[BACKUPKEY][currentProfile] == undefined){//处理当前配置在local中不存在的情况
                settings[BACKUPKEY][currentProfile] = setting
                chrome.storage.local.set(settings,function(){
                    if(catchErr("initialize"))alert(STORAGE_ERRORMSG)
                })
            }
            let options = profileNamesInput.options
            for (let i=0; i<options.length; i++){
                if(options[i].text == currentProfile){
                    options[i].selected = true
                    //设置重命名按钮和删除配置按钮的disabled属性
                    let isDisabled = (currentProfile == DEFAULT_BACKUPNAME)
                    document.getElementById("deleteProfileButton").disabled = isDisabled
                    document.getElementById("renameProfileButton").disabled = isDisabled
                    break
                }
            }
            //当只存在默认设置时select控件的disabled属性设置为true
            profileNamesInput.disabled = (options.length == 1 && profileNamesInput.value == DEFAULT_BACKUPNAME)
            //选项改变则重载
            profileNamesInput.onchange = function(){
                let profileName = this.value
                chrome.storage.local.get(function(settings){
                    let setting = settings[BACKUPKEY][profileName]
                    if(setting == undefined)return
                    setting[BACKUPNAME] = profileName
                    chrome.storage.sync.set(setting,function(){
                        if(catchErr("initialize"))alert(STORAGE_ERRORMSG)
                        initialize()
                    })
                })
            }
        })
        //新建配置
        document.getElementById("addProfileButton").onclick = addProfile
        //删除设置
        document.getElementById("deleteProfileButton").onclick = deleteProfile
        //重命名设置
        document.getElementById("renameProfileButton").onclick = renameProfile

        //"标注、标题、想法、代码块" input 事件
        const inputIds = ["s1Pre","s1Suf","s2Pre","s2Suf","s3Pre","s3Suf","lev1","lev2","lev3","thouPre","thouSuf","codePre","codeSuf"]
        //"是否显示热门标注人数"、"标注添加想法" CheckBox 点击事件
        const CheckBoxIds = ["displayN","addThoughts"]
        const ids = inputIds.concat(CheckBoxIds)
        for(let i=0;i<ids.length;i++){
            let id = ids[i]
            let element = document.getElementById(id)
            let isInput = inputIds.indexOf(id) > -1
            isInput ? element.value = setting[id] : element.checked = setting[id]
            element.onchange = function(){
                let key = this.id
                let value = isInput ? this.value : this.checked
                updateStorageArea({key:key,value:value})
            }
        }
        /************************************************************************************/
        /* 正则匹配初始化 */
        function setRegexpValue(parent,reMsg){
            let regexpInput = parent.getElementsByClassName("regexp")[0]
            setAttributes(regexpInput,{placeholder:"",value:reMsg[1]})
            parent.getElementsByClassName("regexp_pre")[0].value = reMsg[2]
            parent.getElementsByClassName("regexp_suf")[0].value = reMsg[3]
        }
        //正则表达式 input、textarea 内容初始化
        let regexpContainers = document.getElementsByClassName("regexpContainer")
        const reCollection = setting.re
        for(let i = 0;i<reCollection.length;i++){
            setRegexpValue(regexpContainers[i],reCollection[i])
        }
        const checkedReCollection = setting.checkedRe
        let checkBoxCollection = document.getElementsByClassName("contextMenuEnabledInput")
        //已开启正则初始化
        for(let i = 0;i < checkBoxCollection.length;i++){
            checkBoxCollection[i].checked = false//先确保取消选中
            for(let j = 0;j < checkedReCollection.length;j++){
                let checkedId = checkedReCollection[j][0]
                let checkboxId = checkBoxCollection[i].id
                if(checkedId.substr(checkedId.length-1,1) == checkboxId.substr(checkboxId.length-1,1)){//因为需要更改id而这样写
                    checkBoxCollection[i].checked = true
                    let parent = checkBoxCollection[i].parentNode.parentNode
                    setRegexpValue(parent,checkedReCollection[j])
                    break
                }
            }
        }
        //正则表达式 checkbox 点击事件
        for(let i = 0;i < checkBoxCollection.length;i++){
            checkBoxCollection[i].onclick = function(){
                let regexpInput = this.parentNode.parentNode.getElementsByClassName("regexp")[0]
                updateRegexp()//不检查regexpInput.value是否为空，将其留在updateRegexp中检查
                if(regexpInput.value == "" && this.checked){//检查this.checked使得取消选中的动作中不会触发
                    regexpInput.placeholder = "请输入正则表达式"
                    this.checked = false
                }
            }
        }
        //正则表达式 input、textarea input事件（事件绑定不能够放进上方对reCollection的遍历中，因为reCollection可能为空）
        const classNameArray = ["regexp","regexp_pre","regexp_suf"]
        for(let i=0;i<classNameArray.length;i++){
            let collection = document.getElementsByClassName(classNameArray[i])
            for(let j=0;j<collection.length;j++){
                collection[j].onchange = function(){
                    updateRegexp()
                }
            }
        }
    })
}

window.onbeforeunload = function(){//处理直接关闭设置页时onchange不生效的情况
    let activeElement = document.activeElement
    if(activeElement.nodeName == "INPUT" || activeElement.nodeName == "TEXTAREA"){
        const regexpSet = getRegexpSet()
        const currentProfile = document.getElementById("profileNamesInput").value
        regexpSet.allRegexp.currentProfile = currentProfile
        regexpSet.checkedRegexp.currentProfile = currentProfile
        chrome.runtime.sendMessage({type:"saveRegexpOptions",regexpSet:regexpSet})
    }
}