import { EdgeWebstoreClient } from "@plasmo-corp/ewu";

const args = process.argv.slice(2)
const productId = args[0]
const clientId = args[1]
const clientSecret = args[2]
const accessTokenUrl = args[3]
const client = new EdgeWebstoreClient({
  productId,
  clientId,
  clientSecret,
  accessTokenUrl
})
client.submit({
	filePath: "./dist.zip"
}).then(res=>{
	console.log(res)
})