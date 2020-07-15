<template>
  <!-- div的作用是给瀑布流区域设置“垂直滚动条”，使得可以进行上拉操作
    @scroll:滚动条滚动的时候会触发执行
  -->
  <div class="scroll-wrapper" ref="myarticle" @scroll="remember()">
    <!-- 下拉包围上拉 -->
    <!--
      v-model："isLoading" 设置下拉加载状态的
              // true：正在加载，自动修改为真，当发生"下拉"动作就变为true
              // false默认值，加载结束需要手动修改为false
      @refresh="onRefresh" 事件，当发生"下拉"动作是，该事件自动执行
                          // 该事件可以实现数据获取操作
      :success-text="successText" 下拉动作完成后的信息提示[已经是最新的了/文章更新成功]
      success-duration="1500 下拉动作完成后的信息提示 停留时间
    -->
    <van-pull-refresh
      v-model="isLoading"
      @refresh="onRefresh"
      :success-text="successText"
      success-duration="1500"
    >
      <!-- 瀑布流加载效果实现
            瀑布流执行：
            1. 页面加载完毕，其会自动执行
              (内部会判断当前瀑布区域没有数据，当然要执行获取数据)
            2. 鼠标上拉动作，当滚动条到达"算法底部"，会执行
               算法底部：瀑布流认为要加载更多数据的位置
            v-model="loading"   表明是否是加载状态，默认为false
                                // 加载的时候，自动设置为true
                                // 加载完毕，请修改为false
                                // 是加载动画的体现
            :finished  表明瀑布停止了，没有更多数据不给加载了
                      鼠标上拉已经没有反应了
                      如果没有数据了，请设置finished为true
                      就表示都加载好了，显示没有更多了

            finished-text="没有更多了"  瀑布流停止，底部文字提示
            @load="onLoad"  是事件，是做加载数据的时候执行的
      -->
      <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <!-- van-cell单元格组件
              特点：独占一行
              用法非常灵活、复杂
              title：单元格标题内容
              模板中应用超大整型数据，需要通过toString转换为"字符串"
        -->
        <!-- <van-cell v-for="item in list" :key="item" :title="item"/> -->
        <van-cell
          v-for="item in articleList"
          :key="item.art_id.toString()"
          :title="item.title"
          @click="$router.push({name:'article',params:{aid:item.art_id.toString()}})"
        >
          <!-- 通过命名插槽方式体现单元格下方描述信息 -->
          <template slot="label">
            <!-- 新闻封面图片也是通过label描述位置体现
              :column-num 根据type的值决定显示的列数
              v-if="item.cover.type>0" 要求type>0才体现宫格
              :border="false" 宫格没有边框
            -->
            <van-grid
              :column-num="item.cover.type"
              :gutter="10"
              :border="false"
              v-if="item.cover.type>0"
            >
              <!-- 封面图片类型：没有type=0、 1个type=1、 3个type=3 -->
              <!-- v-for可以对数字做遍历 -->
              <!-- v-for="xx in 3" //xx: 1、2、3  -->
              <van-grid-item v-for="item2 in item.cover.type" :key="item2">
                <!-- van-image是表现图片的组件，图片下标是从0开始，而item2是从1开始的，所以要item2-1操作
                  设置lazy-load  "指令"，使得图片有懒加载功能
                  lazy-load  或  :lazy-load="true"  都是表示该属性接收为true的信息
                -->
                <van-image width="85" height="85" :src="item.cover.images[item2-1]" lazy-load/>
              </van-grid-item>
            </van-grid>
            <p>
              <!-- name="close"代表叉号
                item.art_id.toString() 代表被处理的文章id信息
                外部已经有click事件了，内部还有click事件
                内部的click执行的时候，外部也会执行，导致内部失效，这是事件冒泡体现
                处理：阻止事件冒泡
                .stop是vue内部的修饰符，可以阻止事件冒泡
              -->
              <van-icon
                name="close"
                style="float:right;"
                @click.stop="displayDialog(item.art_id.toString())"
              />

              <span>作者:{{item.aut_name}}</span>
              &nbsp;
              <span>评论 :{{item.comm_count}}</span>
              &nbsp;
              <span>时间:{{item.pubdate | formatTime}}</span>
              &nbsp;
            </p>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>

    <!-- 文章更多操作弹出层
      当前(父)组件把showDialog=true的信息传递给子组件
      子组件会把false的信息回传回来对showDialog进行赋值

      弹出框组件只要被关闭，那么其value就由true变为false
      那么@input事件要执行，进而把false信息就回传回来了

      :articleID="nowArticleID" 把当前目标文章id传递给子组件
    -->
    <more-action
      v-model="showDialog"
      :articleID="nowArticleID"
      @dislikeSuccess="handleDislikeSuccess()"
    ></more-action>
  </div>
</template>

<script>
// 对子组件com-moreaction.vue 做 导入、注册、使用
import MoreAction from './com-moreaction.vue'

// 获得文章列表的api
import { apiArticleList } from '@/api/article.js'

export default {
  name: 'com-article',
  components: {
    MoreAction
  },
  // 接收父组件传递过来的频道id信息
  // 1. 简易方式接收
  // props: ['channelID'],
  // 2. 高级方式接收
  props: {
    channelID: {
      // type:类型限制String Number Array, 类型不符合，就接收不到
      // required:true, 参数必须传递
      type: Number,
      required: true
    }
  },
  data () {
    return {
      nowTop: 0, // 记录滚动条卷起的高度
      successText: '文章更新成功', // 下拉动作完成后的动画提示内容
      nowArticleID: '', // 被处理的文章id
      showDialog: false, // 控制子组件弹出框显示的标志
      articleList: [], // 文章列表信息
      // 通过ts声明时间戳条件，这样后期可以灵活发生变化
      ts: Date.now(), // 文章列表分页"时间戳"条件
      // 下拉成员
      isLoading: false, // 是否处于加载状态
      // 瀑布流相关成员
      list: [], // 数据源
      loading: false, // 瀑布流是否加载处于动画效果
      finished: false // 瀑布流是否停止
    }
  },
  created () {
    // 获得真实文章列表数据
    this.getArticleList()
  },
  activated () {
    // 组件被激活，设置滚动条卷起高度为离开时候的位置
    if (this.nowTop) {
      this.$refs.myarticle.scrollTop = this.nowTop
    }
  },
  methods: {
    // 获得滚动条卷起的高度，并赋予给nowTop
    remember () {
      this.nowTop = this.$refs.myarticle.scrollTop
    },
    // 文章不感兴趣的处理处理，清除目标文章
    handleDislikeSuccess () {
      // 让 nowArticleID 文章在列表中消失
      // 1. 获得目标文章id在文章列表中的下标序号
      //    findIndex()是数组的一个方法，可以通过条件获得指定目标在数组列表中的"下标序号"，有遍历机制
      // 各种底层方法api：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide
      const index = this.articleList.findIndex(item => {
        // 满足条件就return为true信息出来，那么当前项目的下标序号就获得的到了
        return item.art_id.toString() === this.nowArticleID
      })
      // 2. 通过下标序号从列表中删除指定的文章
      // 数组.splice(下标, 长度)
      this.articleList.splice(index, 1)
      // (只是页面级删除)
    },

    // 展示子组件弹出框逻辑
    // artID：被处理文章的id
    displayDialog (artID) {
      this.showDialog = true // 弹出框显示
      // data接收artID
      this.nowArticleID = artID
    },

    // 获得文章列表信息
    // async修饰的函数，这个函数如果有return返回信息，
    // 信息类型是Promise对象

    async getArticleList () {
      // 调用api获得数据（参数:频道id、时间戳）
      const obj = {
        channel_id: this.channelID,
        timestamp: this.ts
      }
      const result = await apiArticleList(obj)
      // console.log(result)
      // data接收数据
      // 升级：不要把数据给与data成员，要在瀑布里边发生给与动作
      //       在这里边请return返回，用瀑布接收使用
      return result
      // this.articleList = result.results
    },
    // 下拉执行的动作
    async onRefresh () {
      // 延迟器0.8秒
      await this.$sleep(800)
      // 获得新文章
      const articles = await this.getArticleList()

      if (articles.results.length > 0) {
        // 头部追加新文章、更新时间戳
        this.articleList.unshift(...articles.results)
        this.ts = articles.pre_timestamp
        // 提示： 文章更新成功
        this.successText = '文章更新成功'
      } else {
        // 提示： 已经是最新的了
        this.successText = '已经是最新的了'
      }
      // 下拉动画结束
      this.isLoading = false
    },

    // 瀑布流上拉执行的动作
    async onLoad () {
      // 每次执行给延迟0.8秒
      await this.$sleep(800)

      // 瀑布 与 真实文章 结合
      // 1. 获得真实文章数据
      const articles = await this.getArticleList()
      // articles:{results:文章列表，pre_timestamp:分页时间戳}
      // console.log(articles)
      // 2. 对数据做处理
      if (articles.results.length > 0) {
        // 有获得数据
        // data接收数据，要设置"追加"，不要直接赋值
        // 直接赋值会使得瀑布的数据区域填充不满，会造成瀑布不断加载效果
        // this.articleList = articles.results
        // articles.results:[{id,title,xx},{id,title,xx},{id,title,}……]
        this.articleList.push(...articles.results)
        // ... 展开运算符，是要把[]数组标志给去除，使得内部各个小元素暴露出来，进而被push追加使用
        // this.articleList.push({id,title,xx},{id,title,xx},{id,title,}……)
        // 更新时间戳，方便获取"下一页"数据
        this.ts = articles.pre_timestamp
      } else {
        // 没有获得到数据，要停止瀑布流
        this.finished = true
      }

      // 3. 停止瀑布加载动画
      this.loading = false
    }
  }
}
</script>

<style lang="less" scoped>
// 给上拉列表区域设置样式
.scroll-wrapper {
  height: 100%;
  // 瀑布流区域如果垂直方向内容过多，要呈现滚动条
  // 是瀑布实现的关键要素
  overflow-y: auto;
}
</style>
