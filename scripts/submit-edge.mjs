import { EdgeWebstoreClient } from "@plasmo-corp/ewu";
import * as fs from "fs";

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