/* 书本导出配置功能 */
import $ from 'jquery'
import { main } from './options-main'
import { updateStorageArea, catchErr } from './options-utils'
import {
    BACKUPKEY, BACKUPNAME, DEFAULT_BACKUPNAME, STORAGE_ERRORMSG
} from './options-var'

/* 重命名设置 */
function renameProfile() {
    const promptContainer = $('#promptContainer')
    $('#promptLabel').text('请为所选配置文件输入新的名称')
    const input = $('#promptInput')
    // 确认
    $('#promptConfirmButton')[0].onclick = function () {
    // 修改 local 数据
        chrome.storage.local.get(function (settings) {
            console.log('#promptInput val: ' + input.val())
            if (input.val() === '') {
                input.attr('placeholder', '请输入新的名称')
            } else if (settings[BACKUPKEY][input.val() as string] !== undefined) {
                input.val('').attr('placeholder', '该配置名已存在，请重新输入')
            } else {
                const currentSelect = $('#profileNamesInput').val() as string
                const profile = settings[BACKUPKEY][currentSelect]
                const profileName = input.val() as string
                delete settings[BACKUPKEY][currentSelect]
                settings[BACKUPKEY][profileName] = profile
                const setting = profile
                setting[BACKUPNAME] = profileName
                updateStorageArea({ setting: setting, settings: settings }, function () {
                    promptContainer.css('display', 'none')
                    input.val('').attr('placeholder', '')
                    main()
                })
            }
        })
    }
    promptContainer.css('display', 'block')
    input.trigger('focus')
}

/* 删除设置 */
function deleteProfile() {
    // TODO: enter 确定，esc 取消
    const confirmContainer = $('#confirmContainer')
    $('#confirmLabel').text('请确认是否移除所选配置文件')
    const confirmLabel = $('#confirmLabel')
    // 确认
    $('#confirmButton')[0].onclick = function () {
    // 删除 local 数据
        chrome.storage.local.get(function (settings) {
            const currentSelect = $('#profileNamesInput').val() as string
            if (currentSelect === DEFAULT_BACKUPNAME) return
            delete settings[BACKUPKEY][currentSelect]
            const setting = settings[BACKUPKEY][DEFAULT_BACKUPNAME]// 设置 sync 为默认
            setting[BACKUPNAME] = DEFAULT_BACKUPNAME
            updateStorageArea({ setting: setting, settings: settings }, function () {
                confirmLabel.text('')
                confirmContainer.css('display', 'none')
                main()
            })
        })
    }
    // 取消
    $('#cancelButton')[0].onclick = function () {
        confirmLabel.text('')
        confirmContainer.css('display', 'none')
    }
    confirmContainer.css('display', 'block')
}

/* 新建设置 */
function addProfile() {
    chrome.storage.local.get(function (settings) {
        const promptContainer = $('#promptContainer')
        $('#promptLabel').text('请输入这个新的配置文件名')
        const promptInput = $('#promptInput')
        // "确定"
        $('#promptConfirmButton')[0].onclick = function () {
            const profileName = promptInput.val() as string
            if (profileName === '') { // 未输入
                promptInput.attr('placeholder', '请输入配置名')
            } else if (settings[BACKUPKEY][profileName] !== undefined) { // 键值在 local 中存在
                promptInput.val('')
                promptInput.attr('placeholder', '该配置名已存在，请重新输入')
            } else {
                // 在 local 中新建设置（以 sync 中的数据为值）
                chrome.storage.sync.get(function (setting) {
                    settings[BACKUPKEY][profileName] = setting
                    setting[BACKUPNAME] = profileName
                    updateStorageArea({ setting: setting, settings: settings }, function () {
                        promptContainer.css('display', 'none')
                        promptInput.val('')
                        promptInput.attr('placeholder', '')
                        main()
                    })
                })
            }
        }
        promptContainer.css('display', 'block')
        promptInput.trigger('focus')
    })
}

/* 配置 select 初始化 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initConfigSelect(setting: { [key: string]: any}, settings: { [key: string]: any}) {
    const profileNamesSelect = $('#profileNamesInput')[0] as HTMLSelectElement
    // 先清空 select 列表
    profileNamesSelect.options.length = 0
    // 各配置添加到 select 列表
    Object.keys(settings[BACKUPKEY]).forEach(key=>{
        const option = document.createElement('option')
        option.text = key
        if (key === DEFAULT_BACKUPNAME) {
            profileNamesSelect.add(option, profileNamesSelect.options[0])// 默认设置放第一位
        } else {
            profileNamesSelect.add(option, null)
        }
    })
    // 选中当前配置
    const currentProfile = setting[BACKUPNAME]
    if (settings[BACKUPKEY][currentProfile] === undefined) { // 处理当前配置在 local 中不存在的情况
        settings[BACKUPKEY][currentProfile] = setting
        chrome.storage.local.set(settings, function () {
            if (catchErr('initialize'))console.warn(STORAGE_ERRORMSG)
        })
    }
    const options = profileNamesSelect.options
    for (let i = 0; i < options.length; i++) {
        if (options[i].text === currentProfile) {
            options[i].selected = true
            // 设置重命名按钮和删除配置按钮的 disabled 属性
            const isDisabled = (currentProfile === DEFAULT_BACKUPNAME)
            $('#deleteProfileButton, #renameProfileButton').prop('disabled', isDisabled)
            break
        }
    }
    // 当只存在默认设置时 select 控件的 disabled 属性设置为 true
    profileNamesSelect.disabled = (options.length === 1
        && profileNamesSelect.value === DEFAULT_BACKUPNAME)
    // 选项改变则重载
    $(profileNamesSelect).on('change', function () {
        const profileName = this.value
        chrome.storage.local.get(function (configs) {
            const conf = configs[BACKUPKEY][profileName]
            if (conf === undefined) return
            conf[BACKUPNAME] = profileName
            chrome.storage.sync.set(conf, function () {
                if (catchErr('initialize'))console.warn(STORAGE_ERRORMSG)
                main()
            })
        })
    })
    // 新建配置
    $('#addProfileButton').on('click', addProfile)
    // 删除设置
    $('#deleteProfileButton').on('click', deleteProfile)
    // 重命名设置
    $('#renameProfileButton').on('click', renameProfile)
}

export { initConfigSelect }
