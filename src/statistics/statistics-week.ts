import { Chart, ChartConfiguration } from "chart.js";
import $ from "jquery";
import { readDetailData } from "../types/readDetailTypes";
import { bg, convertTime } from "./statistics-var";


let weekConfig: ChartConfiguration = {
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
let loadedWeekDatas: readDetailData[] = [];
let curWeekBaseTimestamp: number;

function updateWeekConfig(data: readDetailData){
    let {timeMeta, readMeta, baseTimestamp} = data;
    if(loadedWeekDatas.indexOf(data)<0) loadedWeekDatas.push(data);
    curWeekBaseTimestamp = baseTimestamp;
	weekConfig.data!.datasets![0].data = convertTime(timeMeta.readTimeList) as unknown as number[];
}

let weekLine: Chart;

function initWeekStatistics() {
	window.addEventListener('load', async ()=>{
		let readDetail;
		try {
			readDetail = await bg.getReadDetail(0);
			updateWeekConfig(readDetail.datas[0]);
			let canvas = document.getElementById('week-canvas') as HTMLCanvasElement;
			let ctx = canvas.getContext('2d')!;
			weekLine = new Chart(ctx, weekConfig);
		} catch (error) {
			return console.log(error, readDetail);
		}
	});
	
	/* 上周 */
	$('#previousWeek').on('click', async ()=>{
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
		weekLine.update();
	});
	
	/* 下周 */
	$('#nextWeek').on('click', async ()=>{
		let curData = loadedWeekDatas.filter(data=>data.baseTimestamp == curWeekBaseTimestamp)[0];
		let nextIndex = loadedWeekDatas.indexOf(curData) - 1;
		if(nextIndex > -1) {
			updateWeekConfig(loadedWeekDatas[nextIndex]);
			weekLine.update();
		}else{
			alert('已为最新');
		}
	});
}

export {initWeekStatistics};