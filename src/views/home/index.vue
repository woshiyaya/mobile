<template>
  <div class="container">
    <!--
      van-tabs:标签页组件
        v-model设置默认激活项目 ，激活根据是项目的下标，从0开始
      van-tab: 标签页项目组件
        title：标签名称
        内容区域：标签对应内容
    -->
    <van-tabs v-model="activeChannelIndex">
      <!-- 给标签页的左侧或右侧通过命名插槽设置内容 -->
      <div slot="nav-right" class="channel-more" @click="showPopup=true">
        <!-- 三杠图标 -->
        <van-icon name="wap-nav"/>
      </div>
      <van-tab :title="item.name" v-for="item in channelList" :key="item.id">
        <!-- 使用 ，把激活频道id当参数，传递给子组件-->
        <com-article :channelID="item.id"></com-article>
      </van-tab>
    </van-tabs>

    <!--
      应用频道子组件弹出层
      把“我的频道”数据传递给子组件
      传递"激活频道"的下标信息
    -->
    <com-channel
      v-model="showPopup"
      :channelList="channelList"
      :activeChannelIndex.sync="activeChannelIndex"
    ></com-channel>
  </div>
</template>

<script>
// 导入com-channel.vue
import ComChannel from './components/com-channel.vue'

// 导入获得频道的api函数:我的频道
import { apiChannelList } from '@/api/channel.js'

// 导入文章瀑布组件
import ComArticle from './components/com-article.vue'
export default {
  name: 'home-index',
  components: {
    // 注册
    ComArticle,
    ComChannel
  },

  data () {
    return {
      showPopup: false, // 控制子组件弹出层是否显示
      // 频道列表数据
      channelList: [],
      // 设置频道默认激活项目
      activeChannelIndex: 0
    }
  },
  created () {
    // 自动、第一时间 获取频道数据
    this.getChannelList()
  },
  methods: {
    // 获得频道列表数据
    async getChannelList () {
      // 通过api获得数据
      const result = await apiChannelList()
      // console.log(result)
      // data成员接收频道数据
      this.channelList = result.channels
    }
  }
}
</script>

<style scoped lang='less'>
.van-tabs {
  // 弹性布局
  display: flex;
  // 灵活的项目将垂直显示，正如一个列一样
  flex-direction: column;
  height: 100%;
  // 标签页全部内容展示区域
  /deep/ .van-tabs__content {
    // flex:1;的值是1 1 0%，【父控件有剩余空间占1份放大，父控件空间不足按1缩小，自身的空间大小是0%】
    flex: 1;
    overflow: hidden;
  }
  // 标签页具体内容展示区域
  /deep/ .van-tab__pane {
    height: 100%;
  }
  // 给频道下边沿横向设置样式
  /deep/ .van-tabs__line {
    background-color: #1989fa;
  }

  /*给 更多 频道设置样式*/
  .channel-more {
    position: fixed;
    right: 0;
    background-color: white;
    line-height: 88px;
    height: 88px;
    width: 90px;
    text-align: center;
    font-size: 40px;
  }
  /*频道标签页宽度减小一些*/
  /deep/ .van-tabs__wrap {
    width: 90%; /*设置频道列表最大宽度，可以避免最后一个频道被按钮覆盖住*/
  }
}
</style>
