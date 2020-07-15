<template>
  <div class="container">
    <!-- 自己的导航栏
    left-arrow：左侧有箭头
    @click-left：单击左侧箭头的事件处理
    $router.back() 执行路由的后退操作
    -->
    <van-nav-bar title="搜索中心" left-arrow @click-left="$router.back()"/>
    <!-- 搜索输入框
      .trim: 是vue框架修饰符，要去除内容左右空白
      @search: 搜索框单击“回车按钮”的事件触发
    -->
    <van-search v-model.trim="searchText" placeholder="请输入搜索关键词" @search="onSearch(searchText)"/>

    <van-cell-group v-if="suggestionList.length>0">
      <!-- 即时联想数据 -->
      <!-- 联想关键字内容展示列表 -->
      <van-cell icon="search" v-for="(item,k) in suggestionList" :key="k" @click="onSearch(item)">
        <!-- 应为要应用methods方法，并且该方法返回的信息里边有 html标签+css样式
        所以不要直接使用title属性，相反要应用命名插槽，内部结合v-html应用-->
        <div slot="title" v-html="highLightCell(item,searchText)"></div>
      </van-cell>
    </van-cell-group>
    <van-cell-group v-else>
      <!-- 历史联想数据 -->
      <!-- 历史联想记录 -->
      <van-cell title="历史记录">
        <!-- 删除图标
          slot="right-icon" 命名插槽 给 cell单元格的右边显示内容(垃圾桶图标)
          name="delete" 垃圾桶图标
          style="line-height:inherit" 设置内容高度与父级一致
        -->
        <van-icon
          name="delete"
          @click="isDeleteData=true"
          v-show="!isDeleteData"
          slot="right-icon"
          style="line-height:inherit"
        ></van-icon>
        <!-- slot="default" 命名插槽  给单元格定义右侧内容 -->
        <div v-show="isDeleteData" slot="default">
          <span style="margin-right:10px" @click="suggestDelAll()">全部删除</span>
          <span @click="isDeleteData=false">完成</span>
        </div>
      </van-cell>
      <!-- 历史联想项目数据展示 -->
      <van-cell :title="item" v-for="(item,k) in suggestHistories" :key="k">
        <!-- 删除按钮 -->
        <van-icon
          v-show="isDeleteData"
          slot="right-icon"
          name="close"
          style="line-height:inherit"
          @click="suggestDel(k)"
        ></van-icon>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script>
// 获得联想建议数据api
import { apiSearchSuggestion } from '@/api/search.js'

// 创建常量，配置历史关键字的key名称，方便后续开发
const SH = 'suggest-histories'

export default {
  name: 'search-index',
  watch: {
    // searchText进行监听
    searchText: function (newV) {
      // 该监听器每次进来的时候，首先清除 this.timer（就是setTimeout停止）定时器
      clearTimeout(this.timer)
      // 用户没有输入信息不要联想
      if (!newV) {
        // 去除旧的联想数据
        this.suggestionList = []
        return false
      }

      // 防抖技术要介入
      // 对setTimeout的返回结果进行接收，以便可以中断其执行
      // 会返回"整型数字"信息
      // 给当前组件临时声明一个timer的临时成员，这个成员不用事先通过data声明
      // 组件运行期间都生效，使得就是唯一的timer被使用(即使事件被多次调用)
      this.timer = setTimeout(async () => {
        // 正常联想
        const result = await apiSearchSuggestion(newV)
        // console.log(result)
        // data接收
        this.suggestionList = result.options
      }, 1000)
    }
  },
  data () {
    return {
      // 从localStorage获取已经存储好的关键字信息
      // localStorage存储关键字的样子： ['vue','jquery','python'……]
      suggestHistories: JSON.parse(localStorage.getItem(SH) || '[]'),
      // 联想历史记录是否进入删除状态,true删除状态[全部删除、完成、叉号]，false正常状态[垃圾桶]
      isDeleteData: false,
      suggestionList: [], // 联想建议数据列表
      searchText: '' // 用户输入的搜索关键字
    }
  },
  methods: {
    // 删除全部关键字项目
    suggestDelAll () {
      // 1. 页面级，响应式效果
      this.suggestHistories = []
      // 2. 持久级localStorage
      localStorage.removeItem(SH)
    },
    // 删除单个关键字项目
    // index: 被删除项目在列表数组中的下标
    suggestDel (index) {
      // 1. 页面级，响应式效果
      this.suggestHistories.splice(index, 1)
      // 2. 持久级localStorage
      localStorage.setItem(SH, JSON.stringify(this.suggestHistories))
    },
    // 根据关键字要跳转执行，检索展示文章
    // kw：代表检索关键字
    onSearch (kw) {
      // 可以统一对kw关键字做收集存储工作
      if (!kw) {
        // 没有输入任何关键字，禁止文章检索
        return false
      }

      // 把当前的kw关键字存储起来，还要考虑去除重复
      // 把现在的关键字转为Set结合
      const st = new Set(this.suggestHistories)
      // 对set做添加操作(自动去重)
      st.add(kw)
      // 对添加好的关键字集合转换为Array数组,并赋予给suggestHistories的data成员
      // 有响应式效果
      this.suggestHistories = Array.from(st)
      // localStorage维护目前最新的关键字数组
      localStorage.setItem(SH, JSON.stringify(this.suggestHistories))

      this.$router.push('/search/result/' + kw)
    },
    // 关键字高亮设置
    // content: 要高亮设置的目标内容[vue本地项目]
    // keywords: 被匹配的关键字[Vue]
    highLightCell (content, keywords) {
      // 1. 创建正则，i修饰符，表示忽略大小写
      //    A. /  / 方式
      //    B. new RegExp()方式
      //    const reg = /\d{5}/i  或  const reg = new RegExp('\d{5}','i')
      //    由于正则主体内容是keywords变量，不方便使用//创建，相反送RegExp就比较合适
      const reg = new RegExp(keywords, 'i')

      // 2. 正则与目标内容进行匹配
      //    A. test()返回是否匹配到的Boolean值
      //    B. match()返回匹配到的结果（对象、null）
      // 因为要获得匹配到的内容，所以要使用match方法
      // 语法：目标内容.match(正则)
      const rst = content.match(reg)
      // console.log(rst) // ["vue", index: 0, input: "vue本地项目获s", groups: undefined]
      // 结论：
      // rst[0]： 就是从目标内容中匹配到关键字信息【重点】
      // rst['index']：关键字出现的下标位置
      // rst['input']：代表完整的目标内容

      // 如果目标内容没有匹配到关键字，就不要做高亮了，原样输出即可
      if (rst === null) {
        return content
      }

      // 3. 对目标内容的关键字做替换，把"普通"的关键字变为"高亮"的关键字
      // 字符串.replace(目标关键字，替换内容)
      // content.replace('vue'，'<span style="color:red;">vue</span>')
      // content.replace(正则，'<span style="color:red;">rst[0]</span>')
      return content.replace(reg, `<span style="color:red;">${rst[0]}</span>`)
    }
  }
}
</script>

<style scoped lang='less'></style>
