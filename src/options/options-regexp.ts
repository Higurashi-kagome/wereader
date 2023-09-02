import $ from "jquery"
import { getRegexpSet } from "./options-utils"
import { updateStorageArea } from "./options-utils"
import { RegexpInputClassName } from "./options-var"

/********************* 正则匹配初始化 *********************/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function initRegexp(setting: { [x: string]: unknown; re?: any; }) {
	//正则表达式 input、checkBox 初始化
	const replacePatterns = setting.re //{"re1": {re:"pattern/replacement/flag", checked: false}}
	for(const reId in replacePatterns){
		//设置 checkBox 是否 checked
		const checkBox = $('#' + reId)
		checkBox.attr('checked', replacePatterns[reId].checked)
		//设置正则表达式输入框内容
		const parent = checkBox.parent().parent()
		const regexpInput = parent.find('.' + RegexpInputClassName)[0]
		const replacePattern = replacePatterns[reId].replacePattern
		$(regexpInput).attr('placeholder', '').val(replacePattern)
		//因为 Config 中设置了默认正则匹配，replacePatterns 不可能为空，故可在此处绑定 onclick、onchange 事件
		checkBox.on('click', function() {
			const target = $(this)
			const regexpInput = target.parent().parent().find('.' + RegexpInputClassName)
			if(regexpInput.val() == "" && target.attr('checked')){//检查 this.checked 使得取消选中时不会触发
				regexpInput.attr('placeholder', "请输入匹配模式")
				target.attr('checked', 'false')
				return
			}
			//todo：需要确保设置正常更新（始终与设置页状况保持一致）
			//将设置页正则表达式设置同步至 storage
			updateStorageArea(getRegexpSet())
		})
		//正则表达式 input 内容改变事件（将设置页正则表达式设置同步至 storage）
		regexpInput.onchange = function() {updateStorageArea(getRegexpSet())}
	}
}

export {initRegexp}