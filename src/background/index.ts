/**
 * @Date        2024/10/15 10:37:42
 * @Author      zono
 * @Description 
 * 这是背景脚本的主入口文件，它的主要工作：

- 初始化和设置各种监听器和功能

- 处理扩展图标被点击的事件，在点击图标时进行插件更新，这是用于解决生产版本更新，但用户本地的包未更新的情况，有了这个方法，就可以保证用户本地的包处于最新版本
 * */

// 点击打开 sidepanel，不想用 sidepanel 时删掉这段代码
// chrome.sidePanel
//   .setPanelBehavior({ openPanelOnActionClick: true })
//   .catch((error) => console.error(error))
