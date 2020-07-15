<template>
  <div class='container'>
    <!-- van-skeleton：骨架屏组件
      title：第一行标题骨架
      :row="3" 后边还有3行骨架
     -->
    <van-skeleton title :row="3" />
    <van-skeleton title :row="3" />
    <van-skeleton title :row="3" />
  </div>
</template>

<script>
export default {
  name: 'question-index'
}
</script>

<style scoped lang='less'>
.van-skeleton{
  margin-top: 10px;
}
</style>
