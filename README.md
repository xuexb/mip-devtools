# mip-devtools
MIP 的谷歌浏览器扩展插件

- [x] [线上代码本地化](#debug)
    - [x] 总开关
    - [ ] 检测本地服务开启状态
- [ ] [校验规范](#validator)
- [x] [MIP 页面检测](#check)
- [x] [识别路径](#auto-path)
- [x] [清除缓存](#clean)
- [x] [提交链接](#push)
- [ ] 发布打包
    - [ ]  代码压缩
    - [ ]  变量配置
    - [ ]  自动打 `crx` 包

## Feature

<a id="debug"></a>
### 线上代码本地化

把线上的 CDN 路径代理到本地的 `mip server` 中，需要支持：

- `mip.css`
- `mip.js`
- 组件

分别设置代理开关，需要插件和本地的 `mip server` 建立连接，当本地没有启动服务时，提示代理不可用。

<a id="validator"></a>
### 校验规范

由于页面加载后是渲染 DOM 后，所以需要获取当前页面的源代码，而非渲染后的代码，并看是否可以和页面 DOM 结合来做提示。

<a id="check"></a>
### MIP 页面检测

检测当前是不是 MIP 页，如果是则图标变蓝，否则为灰色。或者说点击图标显示菜单时，自动校验规范，不通过为红色。

<a id="auto-path"></a>
### 识别路径

在 MIP 页时自动输出源路径和 MIP-Cache 路径。

<a id="clean"></a>
### 清除缓存

点击时根据配置项的密钥去请求 MIP-Cache 接口删除当前页面缓存，并且需要确认是否清除页面静态文件缓存。

<a id="push"></a>
### 提交链接

点击时根据配置项的密钥去请求百度站长的链接提交接口，推送当前链接提交。

## 配置数据对象

使用用户配置和本地缓存存储。

```
{
    "local": {
        "enabled": true,
        "rules": [
            "*",
            "mip.js",
            "mip.css",
            "mip-ext"
        ]
    },
    "push": {
        "site": "",
        "toekn": ""
    },
    "cache": {
        "authkey": ""
    }
}
```

## 隐私声明

本扩展程序代码全部开源在 [GitHub](https://github.com/xuexb/mip-devtools) ，绝不会存在**盗取用户信息**、**恶意上传用户资料**等行为。

## 感谢

非常感谢 [AMP Chrome Extension](https://github.com/ampproject/amphtml/tree/master/validator/chromeextension)

## 版本

### 1.0

添加代理功能

## License
MIT