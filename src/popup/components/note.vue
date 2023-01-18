<template>
	<el-tab-pane label="笔记">
		<el-collapse v-model="activeNames">
			<el-collapse-item title="获取书评" name="1">
				<el-button @click="bg.copyComment(userVid, false)">纯文本</el-button>
				<el-button @click="bg.copyComment(userVid, true)">HTML</el-button>
			</el-collapse-item>
			<el-collapse-item title="获取标注" name="2">
				<el-button @click="bg.copyBookMarks(false)">本章</el-button>
				<el-button @click="bg.copyBookMarks(true)">全部</el-button>
			</el-collapse-item>
			<el-collapse-item title="获取我的想法" name="3">
				<el-button @click="bg.copyThought(false)">本章</el-button>
				<el-button @click="bg.copyThought(true)">全部</el-button>
			</el-collapse-item>
			<el-collapse-item title="删除标注" name="4">
				<el-button @click="bg.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: false}})">本章</el-button>
				<el-button @click="bg.sendMessageToContentScript({message:{deleteBookmarks:true, isAll: true}})">全部</el-button>
			</el-collapse-item>
		</el-collapse>
		<el-button @click="bg.copyContents()">获取目录</el-button>
		<el-button @click="bg.copyBestBookMarks()">获取热门标注</el-button>
	</el-tab-pane>
</template>

<script lang='ts'>
import {
	bg,
} from '../modules/popup-utils';
export default {
	name: 'Note',
	data () {
		return {
			activeNames: [],
			bg,
			bookId: '',
			userVid: ''
		}
	},
	created () {
		bg.setBookId().then((bookId: string)=>{
			if(!bookId) return window.close()
			bg.getUserVid().then((userVid: string)=>{
				this.userVid = userVid
				if (!userVid) {
					bg.alert('信息获取失败，请确保正常登陆后刷新重试')
					return window.close()
				}
			})
		})
	},
	methods: {
		
	}
}
</script>

<style scoped>

</style>