<template>
  <div class="container">
    <!-- fixed使得van-nav-bar靠顶部固定定位 -->
    <van-nav-bar fixed title="搜索结果" left-arrow @click-left="$router.back()"/>

    <!-- 瀑布流加载效果 -->
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-cell
        v-for="item in searchList"
        :key="item.art_id.toString()"
        :title="item.title"/>
    </van-list>

  </div>
</template>

<script>
// 获得文章api
import { apiSearchList } from '@/api/search.js'
export default {
  name: 'search-result',
  data () {
    return {
      // 瀑布流相关成员
      list: [], // 临时瀑布数据
      loading: false, // 瀑布动画加载效果标志
      finished: false, // 瀑布停止标志

      page: 1, // 页码
      searchList: [] // 根据关键字获得的文章列表信息
    }
  },
  // created () {
  //   // 文章列表
  //   this.getSearchList()
  // },
  methods: {
    // 瀑布加载执行
    async onLoad () {
      await this.$sleep(1000)

      // 获得文章数据
      const args = { q: this.$route.params.keyword, page: this.page }
      const result = await apiSearchList(args)

      // 去除瀑布加载动画效果
      this.loading = false

      // 如果没有获取到(数据获取完毕了)
      if (!result.results.length) {
        // 停止瀑布
        this.finished = true
        return false // 停止后续代码执行
      }

      // 有获取到
      // data追加数据[{},{},{}]
      this.searchList.push(...result.results)
      // 分页累加
      this.page++
    }

    // // 获取文章
    // async getSearchList () {
    //   // 调用api
    //   const args = { q: this.$route.params.keyword }
    //   const result = await apiSearchList(args)
    //   // data接收
    //   this.searchList = result.results
    // }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-sizing: border-box;
  .van-list {
    flex: 1;
    margin-top: 92px;
  }
}
</style>
