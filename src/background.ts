import { settingInitialize } from './background/modules/bg-init';
import { initPopupApi } from './background/modules/bg-popup-api';
import { initRegister } from './background/modules/bg-register';
import { initRightClickMenu } from './background/modules/bg-rightClick';
import { initStatisticsApi } from './background/modules/bg-statistcs-api';

settingInitialize();
initRegister();
initRightClickMenu();
initPopupApi();
initStatisticsApi();