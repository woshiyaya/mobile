<template>
  <div class="container">

    <!--具体布局内容-->
    <div class="user-profile">
      <div class="info">
        <van-image round :src="userinfo.photo"/>
        <h3 class="name">{{userinfo.name}}
          <br>
          <van-tag size="mini">申请认证</van-tag>
        </h3>
      </div>
      <!--
        van-row/van-col：布局组件
        row:设置行
        col:设置列
          span设置列的宽度，总数24
      -->
      <van-row>
        <van-col span="6">
          <p>{{userinfo.art_count}}</p>
          <p>动态</p>
        </van-col>
        <van-col span="6">
          <p>{{userinfo.follow_count}}</p>
          <p>关注</p>
        </van-col>
        <van-col span="6">
          <p>{{userinfo.fans_count}}</p>
          <p>粉丝</p>
        </van-col>
        <van-col span="6">
          <p>{{userinfo.like_count}}</p>
          <p>被赞</p>
        </van-col>
      </van-row>
    </div>
    <van-row class="user-links">
      <van-col span="8">
        <van-icon name="newspaper-o" color="#7af"/>我的作品
      </van-col>
      <van-col span="8">
        <van-icon name="star-o" color="#f00"/>我的收藏
      </van-col>
      <van-col span="8">
        <van-icon name="tosend" color="#fa0"/>阅读历史
      </van-col>
    </van-row>

    <van-cell-group class="user-group">
      <van-cell icon="edit" title="编辑资料" to="/user/profile" is-link/>
      <van-cell icon="chat-o" title="小智同学" to="/user/chat" is-link/>
      <van-cell icon="setting-o" title="系统设置" is-link/>
      <van-cell icon="warning-o" title="退出登录" @click="logout()" is-link/>
    </van-cell-group>
  </div>

</template>

<script>
// 用户基本信息api
import { apiUserInfo } from '@/api/user.js'
export default {
  name: 'user-index',
  data () {
    return {
      userinfo: {} // 用户信息
    }
  },
  created () {
    this.getUserInfo()
  },
  methods: {
    // 退出系统
    logout () {
      // 确认框
      this.$dialog.confirm({
        // title: '标题',
        message: '确认要退出系统么？'
      }).then(() => {
        // 单击确定按钮后处理
        // 清除vuex用户数据
        this.$store.commit('clearUser')
        // 跳转到登录页面
        this.$router.push('/login')
      }).catch(() => {
        // 单击取消按钮的逻辑
      })
    },
    // 获得用户信息
    async getUserInfo () {
      this.userinfo = await apiUserInfo()
    }
  }
}
</script>

<style scoped lang='less'>
/**
&:并且，做连接使用，是less语法
.user{
  &-profile{color:red}
  &-pear{}
  apple{}
}

解析：.user-profile{color:red}  // 并且/连接
      .user-pear{}      // 并且/连接
      .user apple{}     // 派生(子级繁衍关系)
*/
.user {
  &-profile {
    width: 100%;
    height: 300px;
    display: block;
    background: #3296fa;
    color: #fff;
    .info {
      display: flex;
      padding: 40px;
      align-items: center;
      .van-image {
        width: 128px;
        height: 128px;
      }
      .name {
        font-size: 32px;
        font-weight: normal;
        margin-left: 20px;
      }
      .van-tag {
        background: #fff;
        color: #3296fa;
      }
    }
    p {
      margin: 0;
      text-align: center;
    }
  }
  &-group {
    margin-bottom: 30px;
  }
  &-links {
    padding: 30px 0;
    font-size: 24px;
    text-align: center;
    background-color: #fff;
    .van-icon {
      display: block;
      font-size: 48px;
      padding-bottom: 10px;
    }
  }
}
</style>
