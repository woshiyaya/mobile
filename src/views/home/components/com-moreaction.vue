<template>
  <div>
    <!-- 暂时表现弹出框效果
  v-model：设置弹出框是否显示 true显示、false不显示
  title：弹出框标题，可以不设置
  show-cancel-button：显示取消按钮
  :showConfirmButton="false" 不要显示取消按钮，false是boolean值
  showConfirmButton="false" false是字符串

  closeOnClickOverlay 是否在点击遮罩层后关闭弹窗,不要绑定内容，就是true被绑定
  :closeOnClickOverlay="true"

  closed 关闭弹窗时触发,isOneLevel=true，使得一级菜单被设置激活
    -->
    <van-dialog
      :value="value"
      @input="$emit('input',$event)"
      :showConfirmButton="false"
      closeOnClickOverlay
      @closed="isOneLevel=true"
    >
      <van-cell-group v-if="isOneLevel">
        <!-- 一级菜单 -->
        <van-cell title="不感兴趣" icon="location-o" @click="articleDislike()"></van-cell>
        <van-cell title="反馈垃圾内容" icon="location-o" is-link @click="isOneLevel=false"></van-cell>
        <van-cell title="拉黑作者" icon="location-o"></van-cell>
      </van-cell-group>
      <van-cell-group v-else>
        <!-- 二级菜单 -->
        <van-cell icon="arrow-left" @click="isOneLevel=true" />
        <!-- 把举报类型信息当参数传递给事件 -->
        <van-cell
          v-for="item in reportList"
          :key="item.value"
          :title="item.title"
          @click="articleReport(item.value)"
          icon="location-o"
        >
        </van-cell>

      </van-cell-group>
    </van-dialog>
    <!-- :value+@input 是 v-model的体现
        @input="$emit('input')" $emit调用input事件，把感知到的信息
        传递给事件对应的v-model成员里边，即父组件的showDialog
        当前组件，鼠标单击对话框旁处，就可以使得value属性值为false
        这个false信息要传递给showDialog，这可以使得后续该弹出框"不断"被展示出来

        理论上代码应该为：$emit('input',$event.target.value)
        实际上不要设置$event.target.value，设置到不对，因为
        van-dialog是组件，不是普通表单域，$event.target.value不能表达出来当前组件的value属性信息
        @input="$emit('input',$event)" 在van-dialog内部会被"封装"为
        $emit('input',$event.target.value)

        组件标签都是：@input="$emit('input',$event)"
        普通表单域：$emit('input',$event.target.value)
    -->
  </div>
</template>

<script>
// 文章不感兴趣的api函数
import { apiArticleDislike, apiArticleReport } from '@/api/article.js'
export default {
  name: 'more-action',
  // 接收父组件传递来的信息
  // props: ['value', 'articleID'],
  props: {
    value: {
      type: Boolean,
      default: false
    },
    articleID: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      // 文章举报类型明细
      reportList: [
        { title: '其他问题', value: 0 },
        { title: '标题夸张', value: 1 },
        { title: '低俗色情', value: 2 },
        { title: '错别字多', value: 3 },
        { title: '旧闻重复', value: 4 },
        { title: '广告软文', value: 5 },
        { title: '内容不实', value: 6 },
        { title: '涉嫌违法犯罪', value: 7 },
        { title: '侵权', value: 8 }
      ],
      isOneLevel: true // 控制一级、二级信息明细显示
    }
  },
  methods: {
    // 文章举报处理
    // 举报类型
    async articleReport (type) {
      // api执行，目标文章id已经被父组件传递过来的，即 this.articleID
      // 举报过的文章，不删除，还显示，因此当前文章有机会被重复举报
      // 而服务器端针对重复举报文章要返回409的错误状态码

      // 举报结果：成功、失败 两种结果都会存在
      // 如果返回409状态码(是一个致命错误)，api函数执行就停止了，后续代码也就不执行了，所以要感知409的话，不能使用if，相反要使用try/catch(其可以捕捉致命错误，代码不会执行)
      try {
        const args = { articleID: this.articleID, type }
        await apiArticleReport(args)
      } catch (err) {
        // err.response.status===409
        if (err.response.status === 409) {
          // return:停止后续代码的执行
          return this.$toast.fail('文章已经被举报了')
        }
      }
      // 提示成功
      this.$toast.success('文章举报成功')
      // 关闭弹出框
      this.$emit('input', false)
    },

    // 文章不感兴趣处理
    async articleDislike () {
      // 调用api
      // 当前处理，正常情况成功率100%
      await apiArticleDislike(this.articleID)

      this.$toast.success('处理成功')
      // 关闭弹出框,修改父组件的showDialog的值为false，进而影响子组件关闭弹框
      this.$emit('input', false)

      // 调用自己的事件，使得父组件页面文章清除
      this.$emit('dislikeSuccess')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
