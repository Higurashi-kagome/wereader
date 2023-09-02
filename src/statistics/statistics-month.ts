import {
	Chart,
	ChartConfiguration,
} from 'chart.js'
import $ from 'jquery'

import {
	readDetailData,
	readDetailJson,
} from '../types/readDetailTypes'
import {
	bg as statApi,
	convertTime,
} from './statistics-var'
import { Wereader } from '../worker/types/Wereader'

const monthConfig: ChartConfiguration = {
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
}
const loadedMonthData: readDetailData[] = []
let curMonthBaseTimestamp: number
const curDate = new Date()
let curYear = curDate.getFullYear()
let curMonth = curDate.getMonth() + 1

/**
 * @description: 返回数组，用于初始化 config.labels 数组
 * @param totalCount 
 * @return 一个长度为 totalCount，元素为 1 至 totalCount 的数组
 */
function initArray(totalCount: number): number[] {
	const arr = []
	for (let i = 0; i < totalCount; i++) {
		arr[i] = i + 1
	}
	return arr
}

/**
 * @description: 更新 config
 * @param {*} data 月阅读数据
 */
function updateMonthConfig(data: readDetailData) {
	const {timeMeta, baseTimestamp} = data
	if(loadedMonthData.indexOf(data)<0) loadedMonthData.push(data)
	curMonthBaseTimestamp = baseTimestamp
    monthConfig.data!.datasets![0].data = convertTime(timeMeta.readTimeList) as unknown as number[]
    monthConfig.data!.labels = initArray(timeMeta.totalCount)
}

/**
 * @description: 创建月统计图
 */
let monthLine: Chart

function initMonthStatistics() {
	window.addEventListener('load', async () => {
		let readDetail: readDetailJson
		try {
			readDetail = await statApi.getReadDetail()
			updateMonthConfig(readDetail.datas[0])
			monthConfig.data!.datasets![0].label = `${curYear}-${curMonth}`
			const canvas = document.getElementById('month-canvas') as HTMLCanvasElement
			const ctx = canvas.getContext('2d')!
			monthLine = new Chart(ctx, monthConfig)
		} catch (error) {
			chrome.tabs.create({url: Wereader.maiUrl, active: false})
			alert('获取数据失败，默认打开微信读书网页，请在确保正常登陆后刷新该页面重新获取统计')
			return console.log(error, readDetail!)
		}
	})
	
	/* 上月 */
	$('#previousMonth').on('click', async () => {
		const curData = loadedMonthData.filter(data => data.baseTimestamp == curMonthBaseTimestamp)[0]
		const previousIndex = loadedMonthData.indexOf(curData) + 1
		if(previousIndex<loadedMonthData.length) {
			updateMonthConfig(loadedMonthData[previousIndex])
		}else{
			let readDetail
			try {
				readDetail = await statApi.getReadDetail(1, 3, curMonthBaseTimestamp)
				updateMonthConfig(readDetail.datas[1])
			} catch (error) {
				return console.log(error, readDetail)
			}
		}
		curMonth--
		if(curMonth == 0){
			curYear--
			curMonth = 12
		}
		monthConfig.data!.datasets![0].label = `${curYear}-${curMonth}`
		monthLine.update()
	})
	
	/* 下月 */
	$('#nextMonth').on('click', async () => {
		const curData = loadedMonthData.filter(data => data.baseTimestamp == curMonthBaseTimestamp)[0]
		const nextIndex = loadedMonthData.indexOf(curData) - 1
		if(nextIndex > -1) {
			updateMonthConfig(loadedMonthData[nextIndex])
			curMonth++
			if(curMonth>12){
				curYear++
				curMonth = 1
			}
			monthConfig.data!.datasets![0].label = `${curYear}-${curMonth}`
			monthLine.update()
		}else{
			alert('已为最新')
		}
	})
}

export { initMonthStatistics }