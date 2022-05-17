/* 导入各个 content 脚本，调用其中的各个主函数，是 content 脚本的入口 */

import { initAlert } from "./content/modules/content-alert";
import { initDeleteMarksNotification } from "./content/modules/content-deleteBookmarks";
import { initGetChapInfo } from "./content/modules/content-getChapters";
import { initKeyBind } from "./content/modules/content-keyBind";
import { initMarkedDateGetter } from "./content/modules/content-markedData";
import { initMask } from "./content/modules/content-mask";
import { initNotesMenu } from "./content/modules/content-notesMenu";
import { initRightClick } from "./content/modules/content-rightClick";
import { initScrollBar } from "./content/modules/content-scroll-bar";
import { initSearchNote } from "./content/modules/content-searchNote";
import { initSelectAction } from "./content/modules/content-select-action";
import { initTheme } from "./content/modules/content-theme";
import { initThoughtEdit } from "./content/modules/content-thought-edit";
import { initFancyBox } from "./content/modules/fancybox";

initAlert();
initDeleteMarksNotification();
initGetChapInfo();
initKeyBind();
initMarkedDateGetter();
initMask();
initTheme();
initScrollBar();
initSearchNote();
initNotesMenu();
initSelectAction();
initRightClick();
initThoughtEdit();
initFancyBox();