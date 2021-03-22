

let monthConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: '',
            backgroundColor: "rgb(75, 192, 192)",
            borderColor: "rgb(75, 192, 192)",
            data: [],
            fill: false,
            borderWidth: 5,
            pointRadius: 3,
            pointHoverRadius: 9
        }]
    },
    options: {
        responsive: true,
        tooltips: {
            mode: 'index',
            intersect: true,
            titleFontSize: 24,
            bodyFontSize: 24
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: '日期',
                    fontSize: 24
                },
                ticks: {
                    fontSize: 24
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: '时长',
                    fontSize: 24
                },
                ticks: {
                    fontSize: 24
                }
            }]
        },
        legend: {
            labels: {
                fontSize: 24
            }
        }
    }
};
let loadedMonthDatas = [];
let curMonthBaseTimestamp;
let curDate = new Date();
let curYear = curDate.getFullYear();
let curMonth = curDate.getMonth() + 1;
let curDay = curDate.getDate();
const bg = chrome.extension.getBackgroundPage();


/**
 * @description: 将整数数组中的整数由秒转为小时
 * @param {*} readTimeList 整数数组，每个元素代表日阅读秒数
 * @return {*} 单位为小时的数组
 */
function convertTime(readTimeList){
    let = convertedTime = [];
    for (let i = 0; i < readTimeList.length; i++) {
        convertedTime.push((readTimeList[i]/3600).toFixed(2));
    }
    return convertedTime;
}

/**
 * @description: 返回数组，用于初始化 config.lables 数组
 * @param {*} totalCount 
 * @return {*} 一个长度为 totalCount，元素为 1 至 totalCount 的数组
 */
function initArray(totalCount){
    let arr = [];
    for (let i = 0; i < totalCount; i++) {
        arr[i] = i + 1;
    }
    return arr;
}

/**
 * @description: 更新 config
 * @param {*} data 月阅读数据
 */
function updateMonthConfig(data){
    let {timeMeta, readMeta, baseTimestamp} = data;
    if(loadedMonthDatas.indexOf(data)<0) loadedMonthDatas.push(data);
    curMonthBaseTimestamp = baseTimestamp;
    monthConfig.data.datasets[0].data = convertTime(timeMeta.readTimeList);
    monthConfig.data.labels = initArray(timeMeta.totalCount);
}

/**
 * @description: 创建月统计图
 */
window.addEventListener('load', async ()=>{
    let readDetail;
    try {
        readDetail = await bg.getReadDetail();
        updateMonthConfig(readDetail.datas[0]);
        monthConfig.data.datasets[0].label = `${curYear}-${curMonth}`;
        let ctx = document.getElementById('month-canvas').getContext('2d');
        window.monthLine = new Chart(ctx, monthConfig);
    } catch (error) {
        chrome.tabs.create({url: 'https://weread.qq.com/', active: false});
        alert('获取数据失败，默认打开微信读书网页，请在确保正常登陆后刷新该页面重新获取统计');
        return console.log(error, readDetail);
    }
});

/* 上月 */
document.getElementById('previousMonth').addEventListener('click', async ()=>{
    let curData = loadedMonthDatas.filter(data=>data.baseTimestamp == curMonthBaseTimestamp)[0];
    let previousIndex = loadedMonthDatas.indexOf(curData) + 1;
    if(previousIndex<loadedMonthDatas.length) {
        updateMonthConfig(loadedMonthDatas[previousIndex]);
    }else{
        let readDetail;
        try {
            readDetail = await bg.getReadDetail(1, 3, curMonthBaseTimestamp);
            updateMonthConfig(readDetail.datas[1]);
        } catch (error) {
            return console.log(error, readDetail);
        }
    }
    curMonth--;
    if(curMonth == 0){
		curYear--;
		curMonth = 12;
	}
    monthConfig.data.datasets[0].label = `${curYear}-${curMonth}`;
    window.monthLine.update();
});

/* 下月 */
document.getElementById('nextMonth').addEventListener('click', async ()=>{
    let curData = loadedMonthDatas.filter(data=>data.baseTimestamp == curMonthBaseTimestamp)[0];
    let nextIndex = loadedMonthDatas.indexOf(curData) - 1;
    if(nextIndex > -1) {
        updateMonthConfig(loadedMonthDatas[nextIndex]);
        curMonth++;
        if(curMonth>12){
            curYear++;
            curMonth = 1;
        }
        monthConfig.data.datasets[0].label = `${curYear}-${curMonth}`;
        window.monthLine.update();
    }else{
        alert('已为最新');
    }
});






let weekConfig = {
    type: 'line',
    data: {
        labels: ['一','二','三','四','五','六','日'],
        datasets: [{
            label: '',
            backgroundColor: "rgb(54, 162, 235)",
            borderColor: "rgb(54, 162, 235)",
            data: [],
            fill: false,
            borderWidth: 5,
            pointRadius: 3,
            pointHoverRadius: 9
        }]
    },
    options: {
        responsive: true,
        tooltips: {
            mode: 'index',
            intersect: true,
            titleFontSize: 24,
            bodyFontSize: 24
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: '',
                    fontSize: 24
                },
                ticks: {
                    fontSize: 24
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: '时长',
                    fontSize: 24
                },
                ticks: {
                    fontSize: 24
                }
            }]
        },
        legend: {
            labels: {
                fontSize: 24
            }
        }
    }
};
let loadedWeekDatas = [];
let curWeekBaseTimestamp;

function updateWeekConfig(data){
    let {timeMeta, readMeta, baseTimestamp} = data;
    if(loadedWeekDatas.indexOf(data)<0) loadedWeekDatas.push(data);
    curWeekBaseTimestamp = baseTimestamp;
    weekConfig.data.datasets[0].data = convertTime(timeMeta.readTimeList);
}

window.addEventListener('load', async ()=>{
    let readDetail;
    try {
        readDetail = await bg.getReadDetail(0);
        updateWeekConfig(readDetail.datas[0]);
        let ctx = document.getElementById('week-canvas').getContext('2d');
        window.weekLine = new Chart(ctx, weekConfig);
    } catch (error) {
        return console.log(error, readDetail);
    }
});

/* 上周 */
document.getElementById('previousWeek').addEventListener('click', async ()=>{
    let curData = loadedWeekDatas.filter(data=>data.baseTimestamp == curWeekBaseTimestamp)[0];
    let previousIndex = loadedWeekDatas.indexOf(curData) + 1;
    if(previousIndex<loadedWeekDatas.length) {
        updateWeekConfig(loadedWeekDatas[previousIndex]);
    }else{
        let readDetail;
        try {
            readDetail = await bg.getReadDetail(0, 3, curWeekBaseTimestamp);
            updateWeekConfig(readDetail.datas[1]);
        } catch (error) {
            return console.log(error, readDetail);
        }
    }
    window.weekLine.update();
});

/* 下周 */
document.getElementById('nextWeek').addEventListener('click', async ()=>{
    let curData = loadedWeekDatas.filter(data=>data.baseTimestamp == curWeekBaseTimestamp)[0];
    let nextIndex = loadedWeekDatas.indexOf(curData) - 1;
    if(nextIndex > -1) {
        updateWeekConfig(loadedWeekDatas[nextIndex]);
        window.weekLine.update();
    }else{
        alert('已为最新');
    }
});