# 梦姬贴吧助手

重写贴吧助手。
兼容 GreasyMonkey 2.x。
目测应该也兼容 1.x 和 TamperMonkey。

配置菜单在此 (登陆后可见)：<br>
![配置菜单](https://greasyfork.org/forum/uploads/FileUpload/6e/2bfe239b9748b07bbd33d2b34909ab.png)


## 主治功能
- 移除图片的收藏工具栏
- 隐藏挽尊卡提示
- 移除会员彩名
- 引用楼层
- 引用楼中楼回应
- 挽尊卡隐藏
- 贴吧跳转链解除
- 贴吧语音下载
- 贴子关键字屏蔽 [可配置]
- 3日循环隐藏某人贴子 [可配置]
- 屏蔽帖子内文字推广链接
测试于 Chrome & Firefox 32 (GreasyMonkey 2.2)


## 脚本内嵌资源标记
`<% #Filename %>`

 标记  | 含义
:-----:|:---------
   ~   | Stuff in `res` directory, passed as function-comment-extract.
   $   | Stuff in `res` directory, passed as raw file i.e. no quote no wrapper.
  \#   | Execute script and get its return (from `src` directory).
   @   | Include raw file from `src` directory.