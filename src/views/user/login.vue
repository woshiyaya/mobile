<template>
  <div class="user-login">
    <!-- 导航栏 -->
    <van-nav-bar title="登录"></van-nav-bar>
    <!-- 表单部分
      vant里边没有form相关组件，只有普通表单域组件
      van-cell-group是对普通表单域组件做封装
    -->
    <van-cell-group>
      <!--van-field 输入框表单域组件
        label="手机号" 表单域前边的名字设置
        required：不进行校验，设置表单域前边有"红星"
        clearable：表单域内容可以通过右侧“叉号”清除
      -->
      <!-- ValidationProvider配置属性，以完成校验
        rules：配置校验规则
        name="手机号"  设定项目名称，校验失败的时候好给与提示
        v-slot：作用域插槽，用于接收校验的错误信息
        v-slot="stData"
        表单校验失败接收错误信息： {{stData.errors[0]}}

        v-slot="{errors}" 对象解构赋值
        表单校验失败接收错误信息： {{errors[0]}}

        v-slot应用场合：template标签、组件标签
        slot-scope应用场合：template标签、组件标签、普通html标签

        ValidationProvider接收插槽数据必须使用v-slot，不能用slot-scope
        该组件内部规则决定的

        形式：slot-scope="stData"
        （v-slot与 slot-scope作用相似，用于接收插槽数据）

        注意: required|phone ,|竖向 左右不要设置空格

        v-slot="{errors}"
        slot-scope="{errors}"
      -->
      <!-- ref可以用于获得"组件对象" 或 "dom节点对象"
        this.$refs.loginFormRef  // 获得组件对象
      -->
      <ValidationObserver ref="loginFormRef">
        <ValidationProvider rules="required|phone" name="手机号" v-slot="{ errors }">
          <!-- error-message:给输入框设置表达校验错误信息 -->
          <van-field
            v-model="loginForm.mobile"
            type="tel"
            placeholder="请输入手机号码"
            label="手机号"
            required
            clearable
            :error-message="errors[0]"
          />
        </ValidationProvider>
        <ValidationProvider rules="required" name="验证码" v-slot="{ errors }">
          <van-field
            v-model="loginForm.code"
            type="password"
            placeholder="请输入验证码"
            label="验证码"
            required
            clearable
            :error-message="errors[0]"
          >
            <!-- "命名插槽"应用，提示相关按钮，是要给van-field组件内部的slot去填充的
        size="small" 设置按钮大小的
        type="primary" 设置按钮背景颜色
            -->
            <van-button slot="button" size="small" type="primary">发送验证码</van-button>
          </van-field>
        </ValidationProvider>
      </ValidationObserver>
    </van-cell-group>
    <div class="login-btn">
      <!--van-button
        type:按钮背景颜色,info是蓝色
        size:按钮大小的
        round：圆边效果
        block：块级样式设置，占据一行
      -->
      <van-button
        type="info"
        size="small"
        round
        block
        @click="login()"
        :loading="isLogin"
        loading-text="登录中..."
      >登录</van-button>
    </div>
  </div>
</template>

<script>
// 导入校验组件
import { ValidationProvider, ValidationObserver } from 'vee-validate'
// 导入账号校验的api函数
import { apiUserLogin } from '@/api/user.js'

export default {
  name: 'user-login',
  // 组件注册
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data () {
    return {
      isLogin: false, // 按钮是否处于加载中
      // 登录表单数据对象
      // mobile和code是"api数据接口"告诉的，不是自定义的
      loginForm: {
        mobile: '13911111111', // 手机号码
        code: '246810' // 验证码
      }
    }
  },
  methods: {
    async login () {
      // 对全部表单域项目进行校验
      const rst = await this.$refs.loginFormRef.validate()
      // console.log(rst) // false校验失败  true校验成功
      if (!rst) {
        // 校验失败，停止后续代码执行
        return false
      }

      // 按钮处于加载中
      this.isLogin = true

      // apiUserLogin函数执行有可能成功、也有可能失败，请try、catch判断使用
      try {
        // 校验账号有效性
        // 所有api函数返回结果就是axios返回结果，就是Promise对象
        const result = await apiUserLogin(this.loginForm)
        // console.log(result) // 输出服务器端返回的秘钥数据{token:xx,refresh_token:xx}
        // return false
        // 通过Vuex对当前用户登录后返回的状态秘钥信息进行保存
        // 注意：result直接表现为token和refresh_token的对象
        //       result本身不用调用data或 data.data 进一步获取数据
        //       因为data或data.data已经在axios响应拦截器中封装好了
        this.$store.commit('updateUser', result)

        // api函数执行成功代表账号正确
        // 如果报400的错误信息，代表账号错误，并且是致命错误，会阻止后续程序代码运行
        // 因此，判断账号是否正确，不用通过result返回值，需要try/catch介入
      } catch (err) {
        // 回复按钮加载中状态
        this.isLogin = false
        // 账号错误，$toast.fail()是vant组件库的"错误提示"应用语法
        // 与之前的 $message.error()是对应的
        // return 表示停止后续代码执行
        return this.$toast.fail('用户名或密码错误' + err)
      }

      // 回复按钮加载中状态
      this.isLogin = false
      this.$toast.success('登录成功')
      this.$router.push('/home') // 项目首页面
    }
  }
}
</script>

<style scoped lang='less'>
// 登录按钮样式
.login-btn {
  margin: 40px;
}
</style>
