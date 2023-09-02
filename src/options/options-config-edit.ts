/* 书本导出配置功能 */
import $ from "jquery";
import { main } from "./options-main"
import { updateStorageArea, catchErr } from "./options-utils"
import { BACKUPKEY, BACKUPNAME, DEFAULT_BACKUPNAME, STORAGE_ERRORMSG } from "./options-var"

/* 重命名设置 */
function renameProfile(){
	let promptContainer = $("#promptContainer")
	$("#promptLabel").text("请为所选配置文件输入新的名称")
	let input = $("#promptInput")
	//确认
	$("#promptConfirmButton")[0].onclick = function(){
		//修改 local 数据
		chrome.storage.local.get(function(settings){
			console.log('#promptInput val: ' + input.val());
			if(input.val() == ""){
				input.attr('placeholder','请输入新的名称')
			}else if(settings[BACKUPKEY][input.val() as string] != undefined){
				input.val('').attr('placeholder','该配置名已存在，请重新输入')
			}else{
				let currentSelect = $("#profileNamesInput").val() as string;
				let profile = settings[BACKUPKEY][currentSelect]
				let profileName = input.val() as string
				delete settings[BACKUPKEY][currentSelect]
				settings[BACKUPKEY][profileName] = profile
				let setting = profile
				setting[BACKUPNAME] = profileName
				updateStorageArea({setting:setting,settings:settings},function(){
					promptContainer.css('display', 'none')
					input.val('').attr('placeholder','')
					main()
				})
			}
		})
	}
	promptContainer.css('display', 'block')
	input.trigger('focus')
}

/* 删除设置 */
function deleteProfile(){
	// TODO: enter 确定，esc 取消
    let confirmContainer = $("#confirmContainer")
    $("#confirmLabel").text("请确认是否移除所选配置文件")
    let confirmLabel = $("#confirmLabel")
    //确认
    $("#confirmButton")[0].onclick = function(){
        //删除local数据
        chrome.storage.local.get(function(settings){
            let currentSelect = $("#profileNamesInput").val() as string;
            if(currentSelect == DEFAULT_BACKUPNAME)return
            delete settings[BACKUPKEY][currentSelect]
            let setting = settings[BACKUPKEY][DEFAULT_BACKUPNAME]//设置sync为默认
            setting[BACKUPNAME] = DEFAULT_BACKUPNAME
            updateStorageArea({setting:setting,settings:settings},function(){
                confirmLabel.text('')
                confirmContainer.css('display', 'none')
                main()
            })
        })
    }
    //取消
    $("#cancelButton")[0].onclick = function(){
        confirmLabel.text('')
        confirmContainer.css('display', 'none')
    }
    confirmContainer.css('display', 'block')
}

/* 新建设置 */
function addProfile(){
	chrome.storage.local.get(function(settings){
		let promptContainer = $("#promptContainer")
		$("#promptLabel").text("请输入这个新的配置文件名");
		let promptInput = $("#promptInput")
		//"确定"
		$("#promptConfirmButton")[0].onclick = function(){
			let profileName = promptInput.val() as string;
			if(profileName == ""){//未输入
				promptInput.attr('placeholder', "请输入配置名");
			}else if(settings[BACKUPKEY][profileName] != undefined){//键值在local中存在
				promptInput.val('');
				promptInput.attr('placeholder', "该配置名已存在，请重新输入");
			}else{
				//在local中新建设置（以sync中的数据为值）
				chrome.storage.sync.get(function(setting) {
					settings[BACKUPKEY][profileName] = setting
					setting[BACKUPNAME] = profileName
					updateStorageArea({setting:setting,settings:settings},function(){
						promptContainer.css('display', 'none');
						promptInput.val('');
						promptInput.attr('placeholder', "");
						main()
					})
				})
			}
		}
		promptContainer.css('display', 'block');
		promptInput.trigger("focus")
	})
}

/* 配置 select 初始化 */
function initConfigSelect(setting: { [key: string]: any}, settings: { [key: string]: any}){
    let profileNamesSelect = $("#profileNamesInput")[0] as HTMLSelectElement
    //先清空select列表
    profileNamesSelect.options.length = 0
    //各配置添加到select列表
    for(let key in settings[BACKUPKEY]){
        let option = document.createElement("option")
        option.text = key
        if(key == DEFAULT_BACKUPNAME){
            profileNamesSelect.add(option,profileNamesSelect.options[0])//默认设置放第一位
        }else{
            profileNamesSelect.add(option,null)
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
    let options = profileNamesSelect.options
    for (let i=0; i<options.length; i++){
        if(options[i].text == currentProfile){
            options[i].selected = true
            //设置重命名按钮和删除配置按钮的disabled属性
            let isDisabled = (currentProfile == DEFAULT_BACKUPNAME)
            $("#deleteProfileButton, #renameProfileButton").prop('disabled', isDisabled)
            break
        }
    }
    //当只存在默认设置时select控件的disabled属性设置为true
    profileNamesSelect.disabled = (options.length == 1 && profileNamesSelect.value == DEFAULT_BACKUPNAME)
    //选项改变则重载
    $(profileNamesSelect).on('change', function(){
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
    })
    //新建配置
    $("#addProfileButton").on('click', addProfile)
    //删除设置
    $("#deleteProfileButton").on('click', deleteProfile)
    //重命名设置
    $("#renameProfileButton").on('click', renameProfile)
}

export {initConfigSelect};