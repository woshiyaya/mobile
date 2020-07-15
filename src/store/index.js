import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// localStorage 存储用户信息的key名称，统一设置，方便后续使用
const USER_KEY = 'hm-toutiao-mobile-user'

export default new Vuex.Store({
  state: {
    // 读取用户信息，用户信息不一定都会获得到
    // 通过 || 设定，如果localStorage没有数据，就返回{}空对象
    user: JSON.parse(localStorage.getItem(USER_KEY) || '{}')
  },
  mutations: {
    // 修改/更新 用户信息
    // data:   {token:xx,  refresh_token:xx}
    updateUser (state, data) {
      // 1. vuex做更新，使得有“响应式”
      state.user = data
      // 2. localStorage做持久更新
      localStorage.setItem(USER_KEY, JSON.stringify(data))
    },
    // 清除用户信息
    clearUser (state) {
      // 1. vuex做清除，使得有“响应式”
      state.user = {}
      // 2. localStorage做持久清除
      localStorage.removeItem(USER_KEY)
    },
    // 清除token，模拟2小时过期
    clearToken (state) {
      // delete 可以删除对象的成员属性
      // var obj = {name:'tom',leg:2}
      // delete obj.name  // 对name成员属性删除
      // console.log(obj)  // {leg:2}

      delete state.user.token
    }
  },
  actions: {
  },
  modules: {
  }
})
