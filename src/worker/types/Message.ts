// 扩展页面间消息格式
export interface Message{
	target: string,
	type: string,
	data: any
}