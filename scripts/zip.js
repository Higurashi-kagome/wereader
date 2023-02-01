// dist 目录打包为 zip
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const archiver = require("archiver")

const resolve = file => path.join(__dirname, "..", file)
const zipName = 'wereader.zip'
const zipPath = resolve(zipName)

function walkSync(currentDirPath, callback) {
	fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach(function(dirent) {
		const filePath = path.join(currentDirPath, dirent.name)
		if (dirent.isFile()) {
			callback(filePath, dirent)
		} else if (dirent.isDirectory()) {
			walkSync(filePath, callback)
		}
	})
}

fs.unlinkSync(zipPath)

const paths = []
walkSync('dist', function(filepath, stat) {
	paths.push({filename: filepath.replace(/^dist/, ""), filepath})
})
const inputSources = paths.map(p => ({
    readStream: fs.createReadStream(p.filepath),
    name: p.filename
}))
const outputStream = fs.createWriteStream(zipPath)
const archive = archiver('zip', {
    zlib: { level: 9 }
})
archive.pipe(outputStream)
inputSources.forEach(src => archive.append(src.readStream, { name: src.name }))
archive.finalize()
console.log(chalk.yellow(`打包成功：${zipPath}`))