// 用来发布扩展到 Edge，本地运行正常，GitHub Actions 运行报错找不到模块，弃用
import { EdgeWebstoreClient } from "@plasmo-corp/ewu";
import * as fs from "fs";

function upload() {
	const args = process.argv.slice(2)
	if(args.length < 5){
		console.log("参数缺失")
		return
	}
	const productId = args[0]
	const clientId = args[1]
	const clientSecret = args[2]
	const accessTokenUrl = args[3]
	const packFile = args[4]
	if(!fs.existsSync(packFile)){
		console.log(packFile + "不存在")
		return
	}
	const client = new EdgeWebstoreClient({
	productId,
	clientId,
	clientSecret,
	accessTokenUrl
	})
	client.submit({
		filePath: packFile
	}).then(res=>{
		console.log(res)
	})
}

upload()