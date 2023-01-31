// dist 目录打包为 zip

const path = require("path");
const chalk = require("chalk");
const compressing = require("compressing");

const resolve = dir => path.join(__dirname, "..", dir);
const zipName = 'wereader.zip'

const zipPath = resolve(zipName);
compressing.zip
  .compressDir(resolve("dist/"), zipPath)
  .then(() => {
    console.log(chalk.yellow(`Tip: 文件压缩成功，已压缩至【${zipPath}】`));
  })
  .catch(err => {
    console.log(chalk.red("Tip: 压缩报错"));
    console.error(err);
  });