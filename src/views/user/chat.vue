<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>

    <!-- 聊天区域
      this.$refs.talkArea 获得如下div的dom对象
    -->
    <div class="chat-list" ref="talkArea">
      <!-- 小智同学/用户 聊天项目 -->
      <!-- <div class="chat-item left">
        <van-image fit="cover" round :src="XzImg"/>
        <div class="chat-pao">干啥呢，河蟹</div>
      </div>
      <div class="chat-item right">
        <div class="chat-pao">没看正忙，挖沙呢</div>
        <van-image fit="cover" round :src="userinfo.photo"/>
      </div> -->

      <div
        class="chat-item"
        v-for="(item,k) in talks"
        :key="k"
        :class="item.name==='xz'?'left':'right'">
        <van-image fit="cover" round v-if="item.name==='xz'" :src="XzImg"/>
        <div class="chat-pao">{{item.msg}}</div>
        <van-image fit="cover" round v-if="item.name==='vip'" :src="userinfo.photo"/>
      </div>

    </div>

    <!--发表聊天内容的表单构件-->
    <div class="reply-container van-hairline--top">
      <!-- 给输入框设置@keyup.enter事件，使得回车键 触碰也会完成发表信息的功能
        enter是事件修饰符，明确只有"回车键"可以触发该事件
      -->
      <van-field v-model.trim="content" placeholder="说点什么..." @keyup.enter="send()">
        <van-button size="mini" :loading="isloading" @click="send()" slot="button">提交</van-button>
      </van-field>
    </div>

  </div>
</template>

<script>
// 导入socket.io-client
import io from 'socket.io-client'

// 用户基本信息api
import { apiUserInfo } from '@/api/user.js'
// 导入小智头像
import XzImg from '@/assets/img/xz.png'

export default {
  name: 'user-chat',
  data () {
    return {
      // msg 和 timestamp 是服务器端要求的名字，发送和接收的数据都遵守
      // name是自定义成员，请注意维护
      // [
      //  {msg:'用户消息',timestamp:时间,name:'vip'},
      //  {msg:'机器人消息',timestamp:时间,name:'xz'},
      //  {msg:'用户消息',timestamp:时间,name:'vip'},
      //  {msg:'机器人消息',timestamp:时间,name:'xz'},
      // ]
      talks: [], // 全部的聊天内容(用户和机器人的)
      socket: null, // socket.io连接对象，本身不在模板中使用，可以通过null做初始化

      userinfo: {}, // 用户基本信息，使用{}声明空对象，不要使用null，因为其要在模板中应用
      XzImg, // 对象简易成员赋值接收 变量， XzImg:XzImg
      content: '', // 发表的聊天内容
      isloading: false // 提交聊天加载动画
    }
  },
  created () {
    this.getUserInfo()
    // socket.io连接初始化配置，页面加载完毕，连接就配置完成
    this.setSocket()
  },
  beforeDestroy () {
    // 组件不使用了，离开聊天室，要关闭socket.io
    // 节省资源
    this.socket.close()
  },
  methods: {
    // 使得 聊天区域 的滚动条始终在最下边显示
    scrollBottom () {
      // 通过算法，使得滚动条跑到最下边
      // this.$refs.talkArea.scrollHeight // 代表元素区域中高度，包括滚动条

      // 滚动条卷起的告诉
      // 当前元素区域 "窗口顶部" 达到 "元素本身顶部" 的距离
      // this.$refs.talkArea.scrollTop

      // 滚动条最底部设置：scrollTop 等于  scrollHeight-窗口高度  [理论]
      // scrollTop 等于  scrollHeight 也可以完成这样效果 [实际操作，简便]

      // this.$nextTick可以保证data数据变化并完成页面更新的响应式动作后 再做一些其他逻辑
      // 本身是Vue技术
      this.$nextTick(() => {
        this.$refs.talkArea.scrollTop = this.$refs.talkArea.scrollHeight
      })
    },

    // 用户 对 小智 说话
    async send () {
      // 没有数据，不给发送
      if (!this.content) { return false }

      // 按钮等待效果
      this.isloading = true

      // 把聊天内容先存储给talks
      const args = {
        msg: this.content,
        timestamp: Date.now(),
        name: 'vip'
      }
      this.talks.push(args)

      // talks数据更新执行逻辑：数据追加--->滚动条滚动--->(响应式)页面更新
      // 上述过程导致最新的数据不会显示，滚动条底部滚动不彻底

      // 怎么样彻底：
      // talks数据更新：数据追加--->(响应式)页面更新--->滚动条滚动

      // 滚动条滚动到最下边
      this.scrollBottom()

      // 把已经发送好的消息，在文本框中清除
      this.content = ''

      // 延迟0.5秒,在该位置的用意：用户数据立即展示到页面上，而机器人数据等待0.5s后展示
      await this.$sleep(500)

      // 把聊天内容发送给服务器端,利用socket
      // this.socket.emit('服务器端事件名称',传递的数据)
      // 注意：args是一个拥有3个成员的对象，可不是单纯的聊天内容
      this.socket.emit('message', args)

      // 按钮等待状态恢复
      this.isloading = false
    },

    // 建立socket连接
    setSocket () {
      // 客户端 向 服务器端 发请求，建立连接
      // this.socket = io(服务端地址,参数) // socket.io连接
      this.socket = io('http://ttapi.research.itcast.cn', {
        query: {
          token: this.$store.state.user.token
        }
        // autoConnect: false
      }) // socket.io连接 http://ttapi.research.itcast.cn?token=xxx

      // this.socket.connect()

      // 服务器端连接成功，向 客户端 发请求告知
      // 创建事件，感知连接状态,connect是固定标志
      this.socket.on('connect', () => {
        console.log('连接成功')

        // 连接成功让"小智同学"主动发起对话，即给talks里边添加一个记录
        this.talks.push({
          msg: 'outman,最近干啥呢？',
          timestamp: Date.now(),
          name: 'xz'
        })
      })

      // 服务器端 向 客户端 发送回复聊天信息
      // message 是 服务器端 已经声明好的名字，是固定的，代表事件名称
      this.socket.on('message', (back) => {
        // 回来的消息格式为：{msg:机器人回复内容,timestamp:回复时间}
        // console.log(back)
        // 把content存储到talks成员里边
        // this.talks.push({ msg:机器人回复内容,timestamp:回复时间, name: 'xz' })
        this.talks.push({ ...back, name: 'xz' })
        this.scrollBottom() // 滚动条滚动底部
      })
    },
    // 获取用户信息
    async getUserInfo () {
      this.userinfo = await apiUserInfo()
    }
  }
}
</script>

<style lang='less' scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 92px 0 100px 0;
  // 聊天区域
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    // 单条聊天项目
    .chat-item{
      padding: 20px;
      // 头像
      .van-image{
        vertical-align: top;
        width: 80px;
        height: 80px;
      }
      // 聊天内容
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 80px;
        max-width: 140%;
        min-height: 80px;
        line-height: 76px;
        border: 1px solid #c2d9ea;
        border-radius: 8px;
        position: relative;
        padding: 0 20px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 28px;
        color: #333;
        // 箭头标志
        // & 并且连接的意思
        // ::before 伪类选择器
        &::before{
          content: "";
          width: 20px;
          height: 20px;
          position: absolute;
          top: 24px;
          border-top:1px solid #c2d9ea;
          border-right:1px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
// 右侧聊天项目
.chat-item.right{
  text-align: right;
  // 聊天内容
  .chat-pao{
    margin-left: 0;
    margin-right: 30px;
    // 箭头标志
    &::before{
      right: -12px;
      // 倾斜45度
      transform: rotate(45deg);
    }
  }
}
// 左侧聊天项目
.chat-item.left{
  text-align: left;
  // 聊天内容
  .chat-pao{
    margin-left: 30px;
    margin-right: 0;
    // 箭头标志
    &::before{
      left: -10px;
      // 倾斜-135度
      transform: rotate(-135deg);
    }
  }
}
// 留言表单构件，固定定位
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 88px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
