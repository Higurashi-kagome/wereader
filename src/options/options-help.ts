import $ from 'jquery';

const helpContent: {[key: string]: any} = {
    s1Pre: {
        title: '直线标注前缀',
        help: `<p>在微信读书中，标注分三类，分别是<span class="lineinline">波浪线</span>、<span class="lineinline">马克笔</span>和<span class="lineinline">直线</span>：</p>
        <img src="./icons/options-icons/mark.png" alt="mark" style="zoom:60%;" />
        <p><span class="lineinline">直线标注</span>即指被直线标注的文本：</p>
        <img src="./icons/options-icons/markstyle1.png">
        <p>“直线标注前缀”中的内容将会被添加到直线标注的前面。</p>
        <p>同样，下方的“直线标注后缀”中的内容将会被添加到直线标注的后面。</p>
        <p>所以，当“直线标注前缀”和“直线标注后缀”分别被设置为<span class="lineinline">**\`</span>和<span class="lineinline">\`**</span>时，上图中的标注将会被导出为<span class="lineinline">**\`我是个冒险的游侠骑士，名叫堂吉诃德·台·拉·曼却\`**</span>。</p>`
    },
    s2Pre: {
        title: '马克笔标注前缀',
        help: `<p><span class="lineinline">马克笔标注</span>是指被马克笔标注的文本：</p>
        <img src="./icons/options-icons/markstyle2.png">
        <p>“马克笔标注前缀”中的内容将会被添加到马克笔标注的前面。</p>
        <p>下方的“马克笔标注后缀”中的内容将会被添加到马克笔标注的后面。</p>`
    },
    s3Pre: {
        title: '波浪线标注前缀',
        help: `<p><span class="lineinline">波浪线标注</span>是指被波浪线标注的文本：</p>
        <img src="./icons/options-icons/markstyle3.png">
        <p>“波浪线标注前缀”中的内容将会被添加到波浪线标注的前面。</p>
        <p>下方的“波浪线标注后缀”中的内容将会被添加到波浪线标注的后面。</p>`
    },
    lev1Pre: {
        title: '一级标题前缀',
        help: `<p>微信读书中的书通常最多只有三级目录：</p>
        <img src="./icons/options-icons/chapterLevel.png">
        <p>其中排第一的标题（朗读者1）即为<span class="lineinline">一级标题</span>。</p>
        <p>“一级标题前缀”中的内容在导出标题时将会被添加到一级标题前面，相应地，下方的“一级标题后缀”中的内容在导出标题时将会被添加到一级标题之后。如，若这里设置为一个井号加一个空格（# ），同时“一级标题后缀”设置为空，则上面的一级标题导出来后为<span class="lineinline"># 朗读者1</span>。</p>`
    },
    thouSuf: {
        title: '想法后缀',
        help: `<p><span class="lineinline">想法</span>也就是你平时阅读时在书中发表的想法。当你将前后缀设置为两个星号(**)时，导出的想法在 Markdown 中将会被加粗。可使用<span class="lineinline">{createTime}</span>作为占位符导出想法创建时间。</p>`
    },
    metaTemplate: {
        title: '书本信息导出模板',
        help: `设置导出书本信息时所用的模板。模板引擎为 <a href="https://nunjucks.bootcss.com/templating.html" target="_blank">nunjucks</a>。下面是一个模板例子：<p><span class="lineinline">[1] {{metaData.author}}.{{metaData.title}}.{% if metaData.translator %}{{metaData.translator}}，译.{% endif %}{{metaData.publisher}}，{{metaData.publishTime.slice(0, 4)}}</span>`
    },
    footSupTemp: {
        title: '脚注参考格式化模板',
        help: `<p>导出脚注时用来格式化“脚注参考”的模板。通过字符串替换实现，仅支持占位填充</p>`
    },
    footNoteTemp: {
        title: '脚注内容格式化模板',
        help: `<p>导出脚注时用来格式化“脚注内容”的模板。通过字符串替换实现，仅支持占位填充</p>`
    },
    thouMarkSuf: {
        title: '想法标注后缀',
        help: `<p><span class="lineinline">想法标注</span>即想法所对应的书本内容。当你将想法标注前后缀设置为两个星号(**)时，导出的想法标注在 Markdown 中将会被加粗。可使用<span class="lineinline">{createTime}</span>作为占位符导出想法创建时间。</p>`
    },
    codeSuf: {
        title: '代码块后缀',
        help: `<p>扩展支持复制书本中的代码块，你可以在这里设置代码块前后缀。</p>
        <p>比如，当你将代码块前缀设置为<code>\`\`\`python</code>同时将代码块后缀设置为<code>\`\`\`</code>时，你复制得到的代码块在 Markdown 中会按照 python 的语法高亮显示。</p>
        <p>有时你可能不希望导出的代码块前后包含任何内容，这时你可以将代码块前后缀设置为空。</p>`
    },
    re1: {
        title: '模式1',
        help: `<p>
        可通过添加正则替换模式替换标注字符串，模式需遵循以下格式：<code>s/&lt;pattern&gt;/&lt;replacement&gt;/[&lt;flags&gt;]</code>。
        </p>
        <p>比如，你可以输入以下模式以匹配所有开头为“提示”的标注并为匹配到的标注加粗（两端添加**）：</p>
        <code>s/^(提示.*)$/**$1**/</code>。
        <p>下面是一些比较常用的模式：</p>
        <ul>
            <li>
                为开头为"步骤x："(x为0到99中任意整数)的标注加粗：<code>s/^(步骤[0-9]{1,2}[:：].*)$/**$1**/</code>。
            </li>
            <li>
                为开头为数字加一点的标注（如"1．Flask与HTTP"加粗）：<code>s/^([0-9](\.\s?|．).*)$/**$1**/</code>。
            </li>
            <li>
                将图片标题（如"图2-5 404错误响应"）及表格标题（如"表1-1 Flask的依赖包"）导出为居中格式：<code>s/^(图[0-9]{1,2}-[0-9]{1,2} .*|表[0-9]{1,2}-[0-9]{1,2} .*)$/&lt;p align='center'&gt;$1&lt;/p&gt;/</code>。
            </li>
            <li>
                将开头为"注意："、"附注："或"提示："的标注导出为居中格式：<code>s/^((注意|附注|提示)[:：].*)$/&lt;p align='center'&gt;$1&lt;/p&gt;/</code>。
            </li>
        </ul>
        <p><em>注意：</em></p>
        <ul>
            <li>选中正则匹配右方的选中框该正则表达式才会生效。</li>
            <li>单个标注最多匹配一次，也就是说，一条标注在匹配到某个正则表达式并替换完毕后，将不再继续与其他正则表达式进行匹配。所以在添加正则匹配的时候，最好不要让一个标注能够被多个正则表达式匹配到。</li>
            <li>因为正则匹配很容易影响导出效果，所以最好在对正则表达式进行充分测试后再使用正则替换。这是一个可供学习正则表达式的教程：<a href="https://github.com/cdoco/learn-regex-zh" target="_blank">learn-regex-zh</a>。</li>
        </ul>`
    },
    addThoughts: {
        title: '导出标注包含想法',
        help: `<p>选中该选项之后，导出的标注（本章标注或是全书标注）中将包含你在书中留下的想法。</p>`
    },
    thoughtFirst: {
        title: '想法在标注之前',
        help: `<p>选中该选项之后，导出的想法排在对应标注的前面。</p>`
    },
    allTitles: {
        title: '导出标注包含所有章节',
        help: `<p>选中该选项之后，导出全书标注/热门标注时标注中将包含所有章节标题，即使该章节下没有标注/热门标注。</p>`
    },
    displayN: {
        title: '热门标注显示标注人数',
        help: `<p>选中该选项之后，导出的热门标注中将包含每条热门标注的标记人数。</p>`
    },
    mpContent: {
        title: '显示全部公众号摘要',
        help: `<p>选中该选项之后，公众号页面中的每一篇公众号都将显示摘要内容。</p>`
    },
    mpAutoLoad: {
        title: '公众号自动加载下一页',
        help: `<p>选中该选项之后，公众号页面将会在滚动至底部时自动加载下一页。</p>`
    },
    mpShrink: {
        title: '集中显示同时发布的公众号文章',
        help: `<p>选中该选项之后，公众号中同一时间发布的文章将会汇总到一起显示。</p>`
    },
    enableFancybox: {
        title: '开启 fancybox',
        help: `<p>选中该选项之后，将支持读书页图片放大显示。</p>`
    },
    enableThoughtEsc: {
        title: '开启想法转义\<\>',
        help: `<p>发表想法时，有时候 \< 和 \> 将会被转义，选中该选项后扩展会将这两个字符替换为全角形式，避免转义。</p>`
    },
    enableStatistics: {
        title: '开启统计',
        help: `<p>选中该选项之后，将会在 popup 中添加名为“统计”的按钮，点击该按钮可查看周、月阅读时长统计图。</p>`
    },
    enableOption: {
        title: '开启选项',
        help: `<p>选中该选项之后，将会在 popup 中添加名为“选项”的按钮，点击该按钮可进入选项页。</p>`
    },
    enableCopyImgs: {
        title: '开启图片/注释/代码块导出',
        help: `<p>选中该选项之后，将会在导出本章标注时一起导出被标注的图片、注释或代码块。</p>`
    },
    imgTag: {
        title: '图片/注释/代码块占位字符',
        help: `<p>设置标注中的图片占位字符串，比如“[插图]”，扩展将按该设置导出图片/注释/代码块。</p>`
    },
    scale: {
        title: '图片/注释/代码块缩放比例',
        help: `<p>扩展将会按比例缩放图片/注释/代码块后再检测其是否被标注覆盖。</p>`
    },
    selectActionOptions: {
        title: '选中后动作（可按下 Ctrl 临时禁用）',
        help: `<p>在这里可设置选中文字后的动作。设置为“马克笔”则会在每次选中文字时自动点击“马克笔”以标注选中内容。设置为“复制”则在选中文字后自动复制选中内容。设置为“无”则关闭动作。</p>`
    },
    thoughtTextOptions: {
        title: '想法所对应文本被标注时保留',
        help: `<p>（用直线/马克笔/波浪线）标注了某段内容，同时又在这段文本上发布了想法，则在获取随带想法的标注时该段内容会出现两次。在这里可以设置如何保留这段内容。</p>`
    },
    enableDevelop: {
        title: '开发者选项（停用）',
        help: `<p>选中该选项之后，将会在 popup 中添加名为“开发者选项”的按钮，点击该按钮可调用用于测试的某些函数。</p>`
    },
    distinctThouMarks: {
        title: '多条想法对应相同标注时只保留一条标注',
        help: `<p>选中该选项之后，如果有多条想法对应相同标注，将只会导出一条标注，而不会每条想法都相应导出一遍标注。</p>`
    }
}

function insertHelpContent(){
    /* 插入帮助按钮 */
    const helpIcon = `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABIUlEQVQ4y+2TsarCMBSGvxTBRdqiUZAWOrhJB9EXcPKFfCvfQYfulUKHDqXg4CYUJSioYO4mSDX3ttzt3n87fMlHTpIjlsulxpDZbEYYhgghSNOUOI5Ny2mZYBAELBYLer0eAJ7ncTweKYri4x7LJJRS0u12n7XrukgpjSc0CpVSXK/XZ32/31FKNW85z3PW6zXT6RSAJEnIsqy5UGvNZrNhu90CcDqd+C6tT6J+v//2Th+PB2VZ1hN2Oh3G4zGTyQTbtl/YbrdjtVpxu91+Ljyfz0RRhG3bzOfzF+Y4TvNXvlwuaK2pE4tfzr/wzwsty0IIURlL0998KxRCMBqN8H2/wlzXJQxD2u12vVkeDoeUZUkURRU+GAw4HA7s9/sK+wK6CWHasQ/S/wAAAABJRU5ErkJggg==" tabindex="0"></img>`;
    for (const id in helpContent) {
        const target = $(`#${id}`);
        if(helpContent[id].help){
            target.before(`<label for='${id}' id='${id}Label'>${helpContent[id].title}<span class="help-icon">${helpIcon}</span></label>`)
            target.parent().after(`<div class='help-content' hidden=''>${helpContent[id].help}</div>`)
        }
    }
    /* 帮助按钮点击事件 */
    const helpIcons = document.getElementsByClassName("help-icon")
    const helpContents = document.getElementsByClassName("help-content")
    for (let index = 0; index < helpIcons.length; index++) {
        const helpIcon = helpIcons[index] as HTMLElement
        helpIcon.onclick = function(){
            // 第一项是注意事项，总是展示
            const help = helpContents[index + 1] as HTMLElement
            help.hidden = !help.hidden
            return false
        }
    }
}

function initHelpContent() {
    window.addEventListener('load', function(){
        insertHelpContent();
    });
}

export { initHelpContent };
