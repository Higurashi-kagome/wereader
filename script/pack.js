const {PythonShell} = require('python-shell');
const path = require("path")

const parent = path.resolve(__dirname, "..");
let options = {
    scriptPath: 'script',
    args: [parent]
};
PythonShell.run('pack.py', options, function (err, results) {
    if (err) throw err;
    console.log("pack finished");
    console.log("results:");
    results.forEach(line=>{
        console.log(line);
    })
});