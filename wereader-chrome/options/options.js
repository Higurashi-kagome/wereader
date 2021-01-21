/* 设置页 */

main()

//入口
function main(){
    chrome.storage.sync.get(function(setting) {
        console.log("chrome.storage.sync.get(function(setting){\nconsole.log(setting)\n})")
        console.log(setting)
        chrome.storage.local.get(function(settings){
            console.log("chrome.storage.local.get(function(settings){\nconsole.log(settings)\n})")
            console.log(settings)
            console.log("********************************************")
            initialize(setting,settings)
        })
    })
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
                        main()
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
                main()
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
                    main()
                })
            }
        })
    }
    promptContainer.style.display = "block"
    input.focus()
}

//从页面获取正则设置
function getRegexpSet(){
    const regexpKey = "re"
    let config = {} //{'re':{"re1": {replacePattern:"pattern/replacement/flag", checked: false}}}
    config[regexpKey] = {}
    let checkBoxCollection = document.getElementsByClassName("contextMenuEnabledInput")
    for(let i = 0;i < checkBoxCollection.length;i++){
        let regexInputContainer = checkBoxCollection[i].parentNode.parentNode
        let checkBoxId = checkBoxCollection[i].id
        let regexpInputValue = regexInputContainer.getElementsByClassName(RegexpInputClassName)[0].value
        //需要检查匹配模式是否为空
        let isChecked = regexpInputValue != ''?checkBoxCollection[i].checked:false
        config[regexpKey][checkBoxId] = {replacePattern: regexpInputValue, checked: isChecked}
    }
    return {key: regexpKey, value: config[regexpKey]}
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

//配置 select 初始化
function initialConfigSelect(setting,settings){
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
            if(catchErr("initialize"))console.warn(STORAGE_ERRORMSG)
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
                if(catchErr("initialize"))console.warn(STORAGE_ERRORMSG)
                main()
            })
        })
    }
    //新建配置
    document.getElementById("addProfileButton").onclick = addProfile
    //删除设置
    document.getElementById("deleteProfileButton").onclick = deleteProfile
    //重命名设置
    document.getElementById("renameProfileButton").onclick = renameProfile
}

//初始化
function initialize(setting,settings){
    initializeBasic()
    initialConfigSelect(setting,settings)

    /* 当前设置初始化 */
    //"标注、标题、想法、代码块" input 事件
    //"是否显示热门标注人数"、"标注添加想法" CheckBox 点击事件
    const inputAndCheckBoxIds = InputIds.concat(CheckBoxIds)
    for(let i=0;i<inputAndCheckBoxIds.length;i++){
        let id = inputAndCheckBoxIds[i]
        let element = document.getElementById(id)
        let isInput = InputIds.indexOf(id) > -1
        isInput ? element.value = setting[id] : element.checked = setting[id]
        element.onchange = function(){
            let key = this.id
            let value = isInput ? this.value : this.checked
            updateStorageArea({key:key,value:value})
        }
    }
    //"自动标注"选项
    if(setting.selectAction){
        document.getElementById(setting.selectAction).selected =true;
    }
    document.getElementById("selectActionOptions").onchange = function(){
        let options = this.options
        for (i=0; i<options.length; i++){
            if(options[i].selected == true){
                updateStorageArea({key:"selectAction",value:options[i].id})
            }
        }
    }
    /************************************************************************************/
    /* 正则匹配初始化 */
    //正则表达式 input、checkBox 初始化
    const replacePatterns = setting.re //{"re1": {re:"pattern/replacement/flag", checked: false}}
    for(let reId in replacePatterns){
        //设置 checkBox 是否 checked
        let checkBox = document.getElementById(reId)
        checkBox.checked = replacePatterns[reId].checked
        //设置正则表达式输入框内容
        let regexpInput = checkBox.parentNode.parentNode.getElementsByClassName(RegexpInputClassName)[0]
        let replacePattern = replacePatterns[reId].replacePattern
        setAttributes(regexpInput,{placeholder:"",value:replacePattern})
        //因为 Config 中设置了默认正则匹配，replacePatterns 不可能为空，故可在此处绑定 onclick、onchange 事件
        checkBox.onclick = function(){
            let regexpInput = this.parentNode.parentNode.getElementsByClassName(RegexpInputClassName)[0]
            if(regexpInput.value == "" && this.checked){//检查 this.checked 使得取消选中时不会触发
                regexpInput.placeholder = "请输入匹配模式"
                this.checked = false
                return
            }
            //todo：需要确保设置正常更新（始终与设置页状况保持一致）
            //将设置页正则表达式设置同步至 storage
            updateStorageArea(getRegexpSet())
        }
        //正则表达式 input 内容改变事件（将设置页正则表达式设置同步至 storage）
        regexpInput.onchange = function(){updateStorageArea(getRegexpSet())}
    }
}

//处理直接关闭设置页时 onchange 事件不触发的情况
window.onbeforeunload = function(){
    let activeElement = document.activeElement
    if(activeElement.nodeName == "INPUT" || activeElement.nodeName == "TEXTAREA"){
        const regexpSet = getRegexpSet()
        const currentProfile = document.getElementById("profileNamesInput").value
        regexpSet.currentProfile = currentProfile
        chrome.runtime.sendMessage({type:"saveRegexpOptions",regexpSet:regexpSet})
    }
}