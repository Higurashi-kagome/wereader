<h2 align="center"><img src="res/README/icon128.png" height="128"><br>Wereader</h2>

<p align="center"><strong>一个 Chrome / Firefox 扩展：主要用于微信读书做笔记，对常使用 Markdown 做笔记的读者比较有帮助。</strong></p>

<!-- ## 安装 -->

[![](https://img.shields.io/badge/-Chrome-brightgreen?logo=GoogleChrome)](https://chrome.google.com/webstore/detail/%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0%E5%8A%A9%E6%89%8B/cmlenojlebcodibpdhmklglnbaghpdcg?hl=zh-CN) [![](https://img.shields.io/badge/-Edge-brightgreen?logo=MicrosoftEdge)](https://microsoftedge.microsoft.com/addons/detail/%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0%E5%8A%A9%E6%89%8B/iblnlnnpkbhnempmcbioeholmemingmo) [![Mozilla add\-on: Firefox](https://img.shields.io/badge/-Firefox-brightgreen?logo=FirefoxBrowser)](https://addons.mozilla.org/zh-CN/firefox/addon/%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0%E5%8A%A9%E6%89%8B/)

<!-- 不能访问 Chrome 网上应用店时按如下操作在 Chrome 上手动安装（注意：手动安装的扩展不会自动更新）：

1. 首先，下载 [wereader.zip](./wereader.zip)。下载好后解压到某个文件夹（比如 `wereader`）。

2. 接下来，进入 Chrome，在地址栏输入 `chrome://extensions/` 后回车，进入扩展管理页面。

3. 进入页面后，先打开 `开发者模式`，再点击 `加载已解压的扩展程序`，找到前面解压得到的文件夹 `wereader`，**单击**该文件夹，这时候文件夹被选中，点击 `选择文件夹` 即可。

[查看演示](./res/README/install.gif) -->

## 功能

1. 一键导出标注、热门标注、书评、想法、目录；
2. 导出格式自定义；
3. 一键复制图片、注释、代码块；
4. 护眼色主题；
5. 书架分类、书架搜索；
6. 标注搜索、标注目录；
7. 借助正则匹配对标注进行处理；
8. 选中后自动标注、自动复制或自动查询；
9. 解除右键限制；
10. 一键删除标注；
11. 统计周、月阅读时间；
12. 浏览公众号；
13. 读书页图片、代码块放大。

## 致谢

| Item                                                         | Reason                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [wereader](https://github.com/arry-lee/wereader)             | 此项目为该扩展的起源，我先是在 [pythontools/wereader](https://github.com/liuhao326/pythontools/tree/master/wereader) 中完善了该项目，然后才基于 pythontools/wereader 实现了该扩展。 |
| [examples-of-web-crawlers](https://github.com/shengqiangzhang/examples-of-web-crawlers) | 编写 pythontools/wereader 的过程中参考了该项目中的[一键导出微信读书的书籍和笔记](https://github.com/shengqiangzhang/examples-of-web-crawlers/tree/master/12.%E4%B8%80%E9%94%AE%E5%AF%BC%E5%87%BA%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6%E7%9A%84%E4%B9%A6%E7%B1%8D%E5%92%8C%E7%AC%94%E8%AE%B0)。 |
| [jquery/jquery: jQuery JavaScript Library](https://github.com/jquery/jquery) | 简化代码。                                                   |
| [clipboard.js](https://github.com/zenorocha/clipboard.js)    | 实现复制文本。                                               |
| [sweetalert2](https://github.com/sweetalert2/sweetalert2)    | 实现弹窗。                                                   |
| [HbnLg](https://www.iconfont.cn/user/detail?spm=a313x.7781069.1998910419.dcc7d6115&userViewType=collections&uid=4451423) | 图标来源于 [iconfont](https://www.iconfont.cn/collections/index?spm=a313x.7781069.1998910419.3)，图库显示 Hbnlg 为图标作者。 |
| [SingleFile](https://github.com/gildas-lormeau/SingleFile)   | 设置页模仿自该扩展。                                         |
| [weread_helper_extension](https://github.com/ellipse42/weread_helper_extension) | 参考该项目中的代码实现了公众号浏览和书架管理（目前该功能已移除，建议通过手机管理书架）。 |
| [uzairfarooq/arrive](https://github.com/uzairfarooq/arrive)  | 方便监听 DOM 变动。                                          |
| [jquery/jquery\-mousewheel](https://github.com/jquery/jquery-mousewheel) | 方便监听滚轮事件。                                           |

## 参考

| Item                                                                            | Description         |
| ------------------------------------------------------------                    | ------------------- |
| [chrome-plugin-demo](https://github.com/sxei/chrome-plugin-demo)                | Chrome 扩展开发教程   |
| [Extensions - Chrome Developers](https://developer.chrome.com/docs/extensions/) | Chrome 扩展官方文档   |

