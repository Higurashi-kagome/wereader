import $ from 'jquery'
import { DefaultRegexPattern } from '../worker/worker-vars'
import { BACKUPKEY, RegexpInputClassName, STORAGE_ERRORMSG } from './options-var'
// 错误捕捉函数
function catchErr(sender: string) {
    if (chrome.runtime.lastError) {
        console.log(`${sender} => chrome.runtime.lastError`, chrome.runtime.lastError.message)
        return true
    }
    return false
}

// 更新 sync 和 local
// TODO:parma type
function updateStorageArea(
    configMsg: {setting?: {
        [key: string]: unknown;
    }, key?: number|string|symbol, value?: unknown, settings?: {[key: string]: unknown}},
    callback = function () {}
) {
    // 存在异步问题，故设置用于处理短时间内需要进行多次设置的情况
    if (configMsg.setting && configMsg.settings) {
        chrome.storage.sync.set(configMsg.setting, function () {
            catchErr('updateSyncAndLocal')
            chrome.storage.local.set(configMsg.settings!, function () {
                if (catchErr('updateSyncAndLocal'))console.warn(STORAGE_ERRORMSG)
                callback()
            })
        })
    } else if (configMsg.key !== undefined) { // 不排除特殊键值，所以判断是否为 undefined
        const config: {[key: number|string|symbol]: unknown} = {}
        const key = configMsg.key
        const value = configMsg.value
        config[key] = value
        chrome.storage.sync.set(config, function () {
            if (catchErr('updateSyncAndLocal'))console.warn(STORAGE_ERRORMSG)
            chrome.storage.local.get(function (settings) {
                const currentProfile = $('#profileNamesInput').val() as string
                settings[BACKUPKEY][currentProfile][key] = value
                chrome.storage.local.set(settings, function () {
                    if (catchErr('updateSyncAndLocal'))console.warn(STORAGE_ERRORMSG)
                    callback()
                })
            })
        })
    }
}

// 从页面获取正则设置
type reName = 're1' | 're2' | 're3' | 're4' | 're5';
type reConfigType = {replacePattern:string, checked:boolean};
// eslint-disable-next-line no-unused-vars
type reConfigCollectionType = {[key in reName]: reConfigType};
type reConfigKeyType = {re: reConfigCollectionType}
function getRegexpSet() {
    const regexpKey = 're'
    const config: reConfigKeyType = {
        re: {
            re1: DefaultRegexPattern,
            re2: DefaultRegexPattern,
            re3: DefaultRegexPattern,
            re4: DefaultRegexPattern,
            re5: DefaultRegexPattern
        }
    }
    const checkBoxCollection = document.getElementsByClassName('contextMenuEnabledInput')
    for (let i = 0; i < checkBoxCollection.length; i++) {
        const checkBox = checkBoxCollection[i] as HTMLInputElement
        const rgxInputContainer = checkBox.parentNode!.parentNode! as HTMLElement
        const checkBoxId = checkBox.id as reName
        const el = rgxInputContainer.getElementsByClassName(RegexpInputClassName)[0]
        const rgxInput = el as HTMLInputElement
        const regexpInputValue = rgxInput.value
        // 需要检查匹配模式是否为空
        const isChecked = regexpInputValue !== '' ? checkBox.checked : false
        config[regexpKey][checkBoxId] = { replacePattern: regexpInputValue, checked: isChecked }
    }
    return { key: regexpKey, value: config[regexpKey] }
}

export {
    catchErr, updateStorageArea, getRegexpSet, reConfigCollectionType
}
