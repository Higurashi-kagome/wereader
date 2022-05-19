import { settingInitialize } from "./background/modules/bg-init";
import { initRegister } from "./background/modules/bg-register";
import { initRightClickMenu } from "./background/modules/bg-rightClick";
import { initPopupApi } from "./background/modules/bg-popup-api";

settingInitialize();
initRegister();
initRightClickMenu();
initPopupApi();