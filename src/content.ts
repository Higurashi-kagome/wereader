/* content 脚本入口 */

import './content/static/css/rankChapter.css'

import { initAlert } from './content/modules/content-alert'
import { initDeleteMarksNotification } from './content/modules/content-deleteBookmarks'
import { initGetChapInfo } from './content/modules/content-getChapters'
import { initKeyBind } from './content/modules/content-keyBind'
import { initMarkedDateGetter } from './content/modules/content-markedData'
import { initMask } from './content/modules/content-mask'
import { initNotesMenu } from './content/modules/content-notesMenu'
import { initRightClick } from './content/modules/content-rightClick'
import { initScrollBar } from './content/modules/content-scroll-bar'
import { initSearchNote } from './content/modules/content-searchNote'
import { initTheme } from './content/modules/content-theme'
import { initThoughtEdit } from './content/modules/content-thought-edit'
import { initFancyBox } from './content/modules/fancybox'
import { initConfirm } from './content/modules/content-confirm'
import { initSelectAction } from './content/modules/content-select-action'
import './content/modules/content-copy'
import './content/static/css/content-theme-switch.css'
import './content/static/css/common.css'

initAlert()
initDeleteMarksNotification()
initGetChapInfo()
initKeyBind()
initMarkedDateGetter()
initMask()
initTheme()
initScrollBar()
initSearchNote()
initNotesMenu()
initSelectAction()
initRightClick()
initThoughtEdit()
initFancyBox()
initConfirm()
