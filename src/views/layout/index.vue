<template>
  <div class="container">
    <!-- 公共头部
    van-nav-bar是 导航栏组件，
    title：导航中间呈现内容
    right-text：导航右侧呈现内容
    @click-right：右侧文字单击后发生的事件
    fixed：固定定位，定位到页面头部，是样式体现(postion:fixed;top:0;left:0;)
    -->
    <!-- 该头部，在个人中心里边不要显示
      个人中心路由地址：/user
      判断当前路由不等于/user   才显示
    -->
    <van-nav-bar
      fixed
      title="黑马头条"
      right-text="搜索"
      @click-right="$router.push('/search')"
      v-if="$route.path!=='/user'"
    />

    <!-- 如果现在是个人中心，这my-wrapper的向上内边距要清除 -->
    <!-- <div class="my-wrapper" :style="{'padding-top':$route.path==='/user'?0:'46px'}"> -->
    <!--
      当前是个人中心：class="my-wrapper noTop"
      当前是非个人中心：class="my-wrapper"
      noTop在下方的style样式里边有设置padding-top:0
    -->
    <div class="my-wrapper" :class="{noTop:$route.path==='/user'}">
      <!--路由占位符，用于显示 home、question、video、user的组件的-->
      <!-- 通过keep-alive对路由占位符进行缓存，本质缓存的是内部的各个组件 -->
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>

    <!-- 公共脚步
      van-tabbar:标签栏组件
      van-tabbar: route  激活路由功能
      van-tabbar-item
        to: 请求路由地址
        icon：标签栏项目显示的图标，icon图标库在组件库中可以看到
    -->
    <van-tabbar route>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/question" icon="chat-o">问答</van-tabbar-item>
      <van-tabbar-item to="/video" icon="video-o">视频</van-tabbar-item>
      <van-tabbar-item
        :to="$store.state.user.token?'/user':'/login'"
        icon="user-o"
      >{{$store.state.user.token?'我的':'未登录'}}</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  created () {
    console.log(this.$route.path) // /user
  }
}
</script>

<style scoped lang='less'>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  .my-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-top: 92px;
    padding-bottom: 100px;
    box-sizing: border-box;
    // noTop专门给个人中心用的，使得主内容没有线上的边距
    &.noTop {
      padding-top: 0;
    }
  }
}
// .container .my-wrapper.noTop{xxx}
</style>
