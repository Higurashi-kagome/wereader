- [说明](#说明)
- [使用](#使用)
- [功能](#功能)
- [设置](#设置)
- [TODO](#todo)
- [补充](#补充)

## 说明

这是一个Chrome扩展，用于微信读书做笔记

<img src="https://img2020.cnblogs.com/blog/1934175/202006/1934175-20200611114231692-1796260636.png" alt="wereader" style="zoom: 100%;border: 1.5px solid rgba(230,230,230,1);" />

扩展图标来源：[HbnLg](https://www.iconfont.cn/user/detail?spm=a313x.7781069.1998910419.dcc7d6115&userViewType=collections&uid=4451423)

图片无法加载可以到[这里](https://www.cnblogs.com/Higurashi-kagome/p/13092175.html)查看。

项目地址：[Github](https://github.com/liuhao326/wereader)

## 使用

如果可以访问Chrome网上应用店，直接点击[这里](https://chrome.google.com/webstore/detail/%E5%BE%AE%E4%BF%A1%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0%E5%8A%A9%E6%89%8B/cmlenojlebcodibpdhmklglnbaghpdcg?hl=zh-CN)或进入[应用店主页](https://chrome.google.com/webstore/category/extensions?hl=zh-CN)搜索`微信读书笔记助手`安装即可（搜索后可能无法立即找到该扩展，需要点击`更多扩展程序`），不能访问Chrome网上应用店时按如下操作手动安装（建议在Chrome网上应用店安装，因为扩展手动安装后不能够自动更新）：

- 首先，在上面给出的GitHub地址上依次点击`Clone`——`Download ZIP`下载压缩包。下载好后解压。

- 接下来，进入Chrome，按下图进入扩展程序页面：

  <img src="https://images.cnblogs.com/cnblogs_com/Higurashi-kagome/1783389/o_200620111930image-20200620191746304.png" alt="img" style="zoom: 70%;border: 1.5px solid rgba(230,230,230,1);" />

- 进入页面后，先打开`开发者模式`开关，再点击`加载已解压的扩展程序`，找到前面解压得到的文件夹`wereader`，双击进入该文件夹，进入后单击里面的（不是双击）`wereader`文件夹，这时候文件夹被选中，点击`选择文件夹`即可。

## 功能

下面简单介绍，可到[这里](https://www.cnblogs.com/Higurashi-kagome/p/13092175.html)查看部分GIF演示。

- 导出(个人)书评
  - 导出为纯文本

  - 导出为HTML

- 导出标注
  - 导出本章标注

  - 导出全书标注

- 导出目录

- 导出热门标注

- 导出个人想法

- 开启图片/注释复制按钮

- 护眼色主题

- 书架分类展示

## 设置

右击扩展点击`选项`进入扩展设置设置页面：

<div><img src="https://img2020.cnblogs.com/blog/1934175/202007/1934175-20200713154305998-1432747617.png" style="zoom: 80%;border: 1.5px solid rgba(230,230,230,1);" /></div>

在设置页面，你可以设置导出效果。

在微信读书中，标注分三类，分别是波浪线、马克笔和直线：

<img src="https://images.cnblogs.com/cnblogs_com/Higurashi-kagome/1783389/o_200620110908QQ%E6%88%AA%E5%9B%BE20200620190842.png" alt="img" style="zoom:60%;" />

其中直线就是设置页面中所谓`一级标注`，马克笔是`二级标注`，波浪线是`三级标注`，你可以在输入框中设置标注前后缀。

比如，如果你希望书本中用马克笔（二级）标注的文字导出来后加粗，你只需要将二级标注前后缀设置为`**`。

又比如，如果你希望书本中用直线（一级）标注的文字导出来后加下划线，你只需要将一级标注前后缀分别设置为`<u>`和`</u>`。

你也可以在设置页中设置导出标题级别。

默认级别分别是`## `、`### `和`#### `你可以通过自己改变井号数量来改变标题导出效果。

类似地，你可以设置想法前后缀，当你将前后缀设置为`**`时，导出的想法将会加粗。

最后一个选项是`是否显示热门标注标注人数`正如它所说的，你可以设置导出的热门标注中是否带标注人数。

## TODO

- [ ] 批量导出（停）
- [ ] 想法中包含HTML内容的问题（停）
- [ ] 某些时候（频繁使用），获取想法可能会失败（停）
- [ ] 完善注释复制按钮innerHTML显示出错的问题（停）
- [ ] 支持"关闭复制按钮"（停）
- [ ] 报错：
  - [ ] Unchecked runtime.lastError: Cannot access contents of url "chrome-search://local-ntp/local-ntp.html". Extension manifest must request permission to access this host.（观察）
  - [ ] Unchecked runtime.lastError: Cannot access a chrome-extension:// URL of different extension（观察）
  - [ ] Unchecked runtime.lastError: Cannot access contents of url "`www.google.com/search....`". Extension manifest must request permission to access this host.（观察）
- [ ] 偶尔出现的在读书页面无法打开popup页面的情况（观察）
- [ ] 匹配功能/直接在页面中提供标注添加前后缀的选项（缓）
- [ ] 国际化？（缓）
- [ ] 主题切换按钮加载缓慢（缓）
- [ ] 白色黑色切换时的不流畅感（缓）
- [ ] 展示热门标注、想法等内容
- [ ] 导出被标注的注释（缓）
- [ ] 对其他浏览器的支持（缓）
- [ ] 为PR提供便利（缓）
- [ ] 书架搜索功能（缓）
- [ ] 注释复制按钮显示慢的问题（缓）
- [ ] 流程图
- [ ] 函数名、变量名改善
- [ ] 实现方法总结（开发经验）
- [ ] 对标注内图片的导出
- [ ] option.html、help.html、书架按钮美化
- [ ] 主题色初始化完善
- [ ] 直接复制图片到剪切板或是复制Markdown

## 补充

相关仓库：[pythontools](https://github.com/liuhao326/pythontools)

v1.0.1：初次发布

v1.1.0：支持同步设置

v1.2.0：支持图片复制

v1.2.1：支持大图、左侧小图及注释一键复制

v1.2.2：

- 添加：本章内被标注的图片可随标注直接导出。
- 完善：去除不必要的权限、更改插件名

v1.3.0：

- 添加：两种护眼主题
- 完善：捕捉部分bug、解决某些时候注释复制按钮不生效的问题、解决不需要开启复制按钮或复制标注时弹出多余提示“`网页需要加载完毕`”的问题
- 完善：源文件分文件夹存放、重命名部分文件
- 添加：设置页帮助

v1.3.2:

- 解决："chrome.tabs.executeScripts = undefind"的严重错误
- 完善：注释复制按钮

v1.3.3:

- 完善：注释复制按钮
- 添加：`https://weread.qq.com/web/shelf`显示书架

v1.3.4:

- 完善：书架显示