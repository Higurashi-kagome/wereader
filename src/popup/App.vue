<template>
	<div>
		<el-tabs type="border-card">
			<note v-if="readPageRegexp.test(url)"/>
			<shelf/>
			<el-tab-pane v-if="bg.Config.enableStatistics" label="统计">
				<el-button @click="onStaClick">统计</el-button>
			</el-tab-pane>
			<el-tab-pane v-if="bg.Config.enableStatistics" label="选项">
				<el-button @click="onOpClick">选项</el-button>
			</el-tab-pane>
			<el-tab-pane v-if="bg.Config.enableDevelop && readPageRegexp.test(url)" label="开发者选项">
				<el-button v-for="fname in devFun" :key="fname" @click="onDevClick(fname)">
					{{fname}}
				</el-button>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script lang='ts'>
import {
	bg,
	readPageRegexp,
} from './modules/popup-utils'
import Shelf from "./components/shelf.vue"
import Note from "./components/note.vue"
export default {
	name: 'App',
	components: {
		Shelf,
		Note
	},
	data () {
		return {
			bg,
			devFun: bg.getTest(),
			url: ''
		}
	},
	created() {
		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			this.url = tabs[0].url!
		})
	},
	methods: {
		readPageRegexp,
		onStaClick(){
			chrome.tabs.create({url: chrome.runtime.getURL('statistics.html')})
		},
		onOpClick(){
			chrome.runtime.openOptionsPage()
		},
		onDevClick(fname: string){
			this.devFun[fname]()
			window.close()
		}
	}
}
</script>

<style scoped>

</style>