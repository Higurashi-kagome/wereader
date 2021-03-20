/* 从背景页获取用于测试的函数后，在 popup 页面上创建开发者选项面板，方便调用测试函数 */
window.addEventListener('load',()=>{
    if(!bg.Config.enableDevelop) return;
    let functions = bg.getTest();
    let testBtn = document.createElement('button');
    setAttributes(testBtn,{textContent: '开发者选项', id: 'testBtn', className: 'tablinks'});
    let testContent = document.createElement('div');
    testContent.className = "tabcontent vertical-menu";
    for(const funcName in functions){
        let el = document.createElement('a');
        setAttributes(el,{textContent: funcName, onclick: ()=>{
            functions[funcName]();
            window.close();
        }});
        testContent.appendChild(el);
    }
    document.getElementsByClassName('tab')[0].appendChild(testBtn);
    // script 标签在 body 标签最后，所以将元素插入在 script 前面
    document.body.insertBefore(testContent,document.getElementsByTagName('script')[0]);
});