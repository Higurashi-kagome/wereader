const bg: any = chrome.extension.getBackgroundPage()?.statisticsApi;

/**
 * @description: 将整数数组中的整数由秒转为小时
 * @param {*} readTimeList 整数数组，每个元素代表日阅读秒数
 * @return {*} 单位为小时的数组
 */
 function convertTime(readTimeList: number[]): string[]{
    let convertedTime: string[] = [];
    for (let i = 0; i < readTimeList.length; i++) {
        convertedTime.push((readTimeList[i]/3600).toFixed(2));
    }
    return convertedTime;
}

export { bg, convertTime };