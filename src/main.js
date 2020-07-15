import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 导入,Vant是默认的成员导入，Lazyload是按需成员导入
// eslint要求：同一个功能包的不同模块对象要使用一个语句到导入进来
// 默认、按需同时导入 import XXX,{YYY,KKK,MMM} from '模块'
// 注意：默认在前，按需在后
import Vant, { Lazyload } from 'vant'

// vant的样式导入
import 'vant/lib/index.css'
// rem适配基准值 相关依赖包导入
import 'amfe-flexible/index.min.js'

// 导入全局样式控制文件
// 注意：在vant的css样式导入之后设置
import '@/assets/css/global.less'

// 导入vee-validate规则文件
// 本质：就是validate.js文件内容在该处“执行”
import '@/utils/validate.js'

// 导入全部的过滤器成员
import * as filters from '@/utils/filters.js' // global filters

// 注册全部的过滤器
// 全局过滤器注册
// Object.keys() 获得对象的全部成员名称，以数组返回['timeAgo','parseTime','formatTime'...]
Object.keys(filters).forEach(key => {
  // Vue.filter('timeAgo', function(参数){})
  Vue.filter(key, filters[key])
})

// vant的注册
// 本质：全局方式注册了n多的组件和全局成员
//       Vue.component(xx,function(){})
//       Vue.component(xx,function(){})
//       Vue.prototype.xxx = yyy
//       ……
Vue.use(Vant)
// 对Lazyload指令做注册
Vue.use(Lazyload)

// 设置一个全局延迟器，是Vue的继承成员，名称为$sleep，就是"自定义"的
// 使得组件可以调用： this.$sleep() ,开始要做延迟执行
// time形参，表示等待时间，毫秒
Vue.prototype.$sleep = (time) => {
  // Promise对象返回：应用端可以介入await，这样异步过程变为同步过程，可以保证当前代码没有执行完毕，后续代码不要执行
  return new Promise((resolve) => {
    // setTimeout设置具体延迟
    setTimeout(() => {
      // resolve()是空执行，打酱油的
      resolve()
    }, time)
  })
}

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// 在main.js中添加如下代码  此代码是采用的 5+ Runtime中的plus对象
// 作用：使得手机的back返回键 针对我们的项目生效
document.addEventListener('plusready', function () {
  var webview = window.plus.webview.currentWebview()
  window.plus.key.addEventListener('backbutton', function () {
    webview.canBack(function (e) {
      if (e.canBack) {
        webview.back()
      } else {
        // webview.close(); //hide,quit
        // plus.runtime.quit();
        // 首页返回键处理
        // 处理逻辑：1秒内，连续两次按返回键，则退出应用；
        var first = null
        window.plus.key.addEventListener('backbutton', function () {
          // 首次按键，提示‘再按一次退出应用’
          if (!first) {
            first = new Date().getTime()
            setTimeout(function () {
              first = null
            }, 1000)
          } else {
            if (new Date().getTime() - first < 1500) {
              window.plus.runtime.quit()
            }
          }
        }, false)
      }
    })
  })
})
