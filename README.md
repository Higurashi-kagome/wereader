# 📚 wereader

一个Chrome插件，用于微信读书做笔记

<div align=center><img src="https://img2020.cnblogs.com/blog/1934175/202006/1934175-20200611114231692-1796260636.png" alt="wereader" style="zoom: 100%;" /></div>

图标来源：[HbnLg](https://www.iconfont.cn/user/detail?spm=a313x.7781069.1998910419.dcc7d6115&userViewType=collections&uid=4451423)

图片无法加载可以到[这里](https://www.cnblogs.com/Higurashi-kagome/p/13092175.html)查看。

项目地址：[Github](https://github.com/liuhao326/wereader)

**现在已更新至v1.2.1，支持图片、注释一键复制。**

欢迎PR或star:star:， 有什么问题也可以提 issue。

你的支持将使我更加专注于开源和完善代码:two_hearts:。

## 使用

- 首先，在上面给出的GitHub地址上依次点击`Clone`——`Download ZIP`下载压缩包。下载好后解压。

- 接下来，进入Chrome，按下图进入扩展程序页面：

  <img src="https://images.cnblogs.com/cnblogs_com/Higurashi-kagome/1783389/o_200620111930image-20200620191746304.png" alt="img" style="zoom: 80%;" />

- 进入页面后，先打开`开发者模式`开关，再点击`加载已解压的扩展程序`，找到前面解压得到的文件夹`wereader`，双击进入该文件夹，进入后单击里面的（不是双击）`wereader`文件夹，这时候文件夹被选中，点击`选择文件夹`即可。

## 功能

下面简单介绍，可到[这里](https://www.cnblogs.com/Higurashi-kagome/p/13092175.html)查看部分GIF演示。

1. **导出(个人)书评**

   - 导出为纯文本

   - 导出为HTML

2. **导出标注**

   - 导出本章标注

   - 导出全书标注


3. **导出目录**


4. **导出热门标注**


5. **导出个人想法**

6. **开启复制按钮**

   用于一键书中复制图片或注释内容。


## 设置

右击插件点击`选项`进入插件设置设置页面：

![img](https://img2020.cnblogs.com/blog/1934175/202006/1934175-20200611111402853-277977098.gif)

在设置页面，你可以设置导出效果。

在微信读书中，标注分三类，分别是波浪线、马克笔和直线：

<img src="https://images.cnblogs.com/cnblogs_com/Higurashi-kagome/1783389/o_200620110908QQ%E6%88%AA%E5%9B%BE20200620190842.png" alt="img" style="zoom:80%;" />

其中直线就是设置页面中所谓`一级标注`，马克笔是`二级标注`，波浪线是`三级标注`，你可以在输入框中设置标注前后缀。

比如，如果你希望书本中用马克笔（二级）标注的文字导出来后加粗，你只需要将二级标注前后缀设置为`**`。

又比如，如果你希望书本中用直线（一级）标注的文字导出来后加下划线，你只需要将一级标注前后缀分别设置为`<u>`和`</u>`。

你也可以在设置页中设置导出标题级别。

默认级别分别是`## `、`### `和`#### `你可以通过自己改变井号数量来改变标题导出效果。

类似地，你可以设置想法前后缀，当你将前后缀设置为`**`时，导出的想法将会加粗。

最后一个选项是`是否显示热门标注标注人数`正如它所说的，你可以设置导出的热门标注中是否带标注人数。

## TODO

- [ ] 批量导出
- [ ] 想法中包含HTML内容的问题
- [ ] 报错：Unchecked runtime.lastError: The message port closed before a response was received.
- [ ] 支持"关闭复制按钮"
- [ ] 彩蛋

## 补充

相关仓库：[pythontools](https://github.com/liuhao326/pythontools)

因为没有相关信用卡，所以没有发布到Chrome网上应用商店。

v1.0.1：初次发布

v1.1.0：添加同步设置能力

v1.2.0：添加图片复制功能

v1.2.1：支持大图、左侧小图及注释一键复制

