<template>
  <div class="comment">
    <!--van-list：实现瀑布加载效果-->
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-cell v-for="item in commentList" :key="item.com_id.toString()">
        <!-- 作者头像
          slot="icon" 是cell单元格命名插槽，自定义左侧图标
        -->
        <div slot="icon">
          <img class="avatar" :src="item.aut_photo" alt>
        </div>
        <!-- 作者名称
          slot="title" 是cell单元格命名插槽，左侧标题内容
        -->
        <div slot="title">
          <span>{{item.aut_name}}</span>
        </div>
        <!-- 点赞
          slot="default" 是cell单元格命名插槽，右侧内容
          danger:点赞，红色
          default:没有点赞，没有特殊颜色
        -->
        <div slot="default">
          <van-button
            icon="like-o"
            size="mini"
            plain
            :type="item.is_liking?'danger':'default'"
          >&nbsp;{{item.like_count}}</van-button>
        </div>
        <!-- 评论内容和时间
          slot="label" 是cell单元格命名插槽，下方描述信息
        -->
        <div slot="label">
          <p>{{item.content}}</p>
          <p>
            <span>{{item.pubdate | formatTime}}</span>
            ·
            <span
              @click="openReply(item.com_id.toString())"
            >{{item.reply_count}}&nbsp;回复</span>
          </p>
        </div>
      </van-cell>
    </van-list>

    <!-- 回复列表展示-弹出层/瀑布 -->
    <van-popup v-model="showReply" position="bottom" :style="{ height: '80%' }" round>
      <!-- 瀑布加载效果 -->
      <van-list
        v-model="reply.loading"
        :finished="reply.finished"
        finished-text="没有更多了"
        @load="onLoadReply"
      >
        <van-cell v-for="item in replyList" :key="item.com_id.toString()">
          <!-- 作者头像 -->
          <div slot="icon">
            <img class="avatar" :src="item.aut_photo" alt>
          </div>
          <!-- 作者名称 -->
          <div slot="title">
            <span>{{item.aut_name}}</span>
          </div>
          <!-- 回复内容和时间 -->
          <div slot="label">
            <p>{{item.content}}</p>
            <p>
              <span>{{item.pubdate | formatTime}}</span>
            </p>
          </div>
        </van-cell>
      </van-list>
    </van-popup>

    <!-- 添加评论或回复的表单域：html标签+css样式 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="contentCorR" placeholder="写评论或回复...">
        <!-- slot="button"命名插槽，表明要给van-field的指定位置填充内容，button是输入框的右侧-->
        <van-button size="mini" :loading="submitting" slot="button" @click="add()">提交</van-button>
      </van-field>
    </div>
  </div>
</template>

<script>
// 回复列表api、添加评论或回复
import { apiReplyList, apiAddCorR } from '@/api/reply.js'
// 评论列表api
import { apiCommentList } from '@/api/comment.js'
export default {
  name: 'com-comment',
  data () {
    return {
      // 添加评论或回复相关-------------------------------
      contentCorR: '', // 评论或回复的内容
      submitting: false, // 添加动作是否正在进行

      // 回复相关--------------------------------------
      replyList: [], // 回复列表数据
      lastID: null, // 分页标志
      commentID: '', // 被单击查看的目标评论id

      showReply: false, // 回复弹出层是否展示
      // 回复瀑布相关成员，通过reply成员包围，使得与外部的评论瀑布成员没有冲突
      reply: {
        list: [],
        loading: false, // 瀑布动画
        finished: false // 瀑布停止标志
      },

      // 评论列表相关--------------------------------
      commentList: [],
      // offset不需要在模板中使用，所以可以使用null
      offset: null, // 评论分页标志,数据偏移量

      // 评论瀑布相关成员
      list: [], // demo数据
      loading: false, // 瀑布动画控制
      finished: false // 瀑布停止控制
    }
  },
  methods: {
    // 添加评论或回复
    // 如何判断当前要做"评论"还是"回复",判断showReply:true回复     false评论
    async add () {
      // 空的数据不给与处理
      if (!this.contentCorR) {
        this.$toast.fail('请输入一些内容！')
        return false
      }

      // 按钮处于加载状态
      // 注意：不要放到延迟器下边
      this.submitting = true

      // 延迟器
      await this.$sleep(800)

      if (this.showReply) {
        // 【添加回复】 target: 当前激活评论id，artID：文章id
        const result = await apiAddCorR({
          target: this.commentID,
          content: this.contentCorR,
          artID: this.$route.params.aid
        })
        // 把添加好的回复信息，追加到回复列表里边，replyList，unshift头部追加
        // 引用的名称为"new_obj"，代表添加好的完成回复记录信息
        this.replyList.unshift(result.new_obj)

        // 获得当前评论的下标信息
        // findIndex()遍历数组，根据条件找到某个元素的下标
        const index = this.commentList.findIndex(item => {
          // item:代表每个数组元素
          // 条件是：item.com_id.toString()===this.commentID
          return item.com_id.toString() === this.commentID
        })
        // 通过index找到目标评论，对reply_count做累加
        this.commentList[index].reply_count++
      } else {
        // 【添加评论】 target:文章id(来自路由参数)
        const result = await apiAddCorR({
          target: this.$route.params.aid,
          content: this.contentCorR
        })
        // console.log(result)
        // 新添加的评论的完成记录，会被服务器端返回回来，引用的名称为new_obj
        // 现在要把新添加好的评论放到页面上显示，就是要给 当前评论列表 做追加unshift头部
        this.commentList.unshift(result.new_obj)
      }
      // 清除添加的表单域信息
      this.contentCorR = ''
      // 恢复按钮为正常状态
      this.submitting = false
    },
    // 开启 回复弹出层 逻辑
    // comID: 当前被单击查看的目标评论id
    openReply (comID) {
      this.commentID = comID // 收集目标评论id
      this.showReply = true // 展示回复弹出层

      // 给回复弹出层 和 瀑布 做初始化
      this.reply.finished = false
      this.lastID = null
      this.replyList = []
    },
    // 回复瀑布加载
    async onLoadReply () {
      await this.$sleep(800)

      // 获得回复列表数据(回复列表数据 与 评论列表数据 结构完全一致)
      const replys = await apiReplyList({
        commentID: this.commentID,
        lastID: this.lastID
      })
      // 瀑布加载动画消失
      this.reply.loading = false
      // 判断是否有数据
      if (!replys.results.length) {
        // 没有：瀑布停止
        this.reply.finished = true
        return false
      }
      // 有：追加 + offset
      this.replyList.push(...replys.results)
      this.lastID = replys.last_id // 维护分页偏移量
    },

    // 评论瀑布
    async onLoad () {
      await this.$sleep(800)

      // 根据文章id获得评论列表
      const comments = await apiCommentList({
        articleID: this.$route.params.aid,
        offset: this.offset
      })
      // 瀑布动画消失
      this.loading = false

      // 判断是否有获得到评论列表
      // comments.results: [{},{},{},……]
      if (!comments.results.length) {
        // 没有数据瀑布停止
        this.finished = true
        return false // 停止后续代码执行
      }
      // 有数据,给追加到 commentList成员里边
      this.commentList.push(...comments.results)
      // 对分页标志offset进行赋值
      this.offset = comments.last_id
    }
  }
}
</script>

<style lang="less" scoped>
.comment {
  margin-top: 15px;
  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 100%;
    margin-right: 10px;
  }
  /deep/ .van-cell__title {
    .van-cell__label {
      width: 400px;
    }
  }
  // 添加评论或回复构件 样式
  .reply-container {
    position: fixed;
    left: 0;
    bottom: 0;
    height: 88px;
    width: 100%;
    background: #f5f5f5;
    z-index: 9999;
  }
}
</style>
