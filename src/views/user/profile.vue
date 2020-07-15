<template>
  <div class="page-user-profile">
    <!-- @click-right="saveProfile()"是van-nav-bar 给 右侧 文字信息 设置的单击事件 -->
    <van-nav-bar
      left-arrow
      @click-left="$router.back()"
      title="编辑资料"
      right-text="保存"
      @click-right="saveProfile()"
    ></van-nav-bar>
    <!-- 绘制 头像、名称、性别、生日 的单元格 -->
    <van-cell-group>
      <!--
          center：使得单元格内容垂直方向居中显示
      -->
      <van-cell title="头像" is-link center @click="showPhoto=true">
        <!--
            单元格可以通过命名插槽对各个位置进行填充
            具体要表现头像 slot="default" 定义value右侧单元格内容
        -->
        <!--
            round 使得图片变为圆形
            fit="cover" 对图片做适应 保持宽高缩放图片，使图片的“短边”能完全显示出来，裁剪“长边”
        -->
        <van-image slot="default" width="50" height="50" fit="cover" round :src="userprofile.photo"></van-image>
      </van-cell>
      <van-cell title="名称" is-link :value="userprofile.name" @click="showName=true"></van-cell>
      <van-cell title="性别" is-link :value="userprofile.gender===0?'男':'女'" @click="showSex=true"></van-cell>
      <van-cell title="生日" is-link :value="userprofile.birthday" @click="showBirthday=true"></van-cell>
    </van-cell-group>

    <!-- 头像弹出层
        高度不配置，通过内容自动填充
    -->
    <van-popup v-model="showPhoto" position="bottom">
      <!-- 单击单元格的时候 执行了input表单的点击事件 -->
      <van-cell title="本地相册选择图片" is-link @click="$refs.mypic.click()"></van-cell>
      <van-cell title="拍照" is-link></van-cell>
    </van-popup>
    <!-- 隐藏状态的上传表单域
      ref：可以这样 this.$refs.mypic  方式获得到当前input的元素对象
      如果不通过ref，也可以通过其他方式获取，
      例如id  document.getElementById('pic')
      ref和id 方式获得的元素对象本质完全一样
      上传表单域自带click，不用声明
    -->
    <input type="file" ref="mypic" id="pic" @change="startUpload()" style="display:none;">

    <!-- 名称弹出层
        高度不配置，通过内容自动填充
    -->
    <van-popup v-model="showName" position="bottom" style="height:20%">
      <!-- 通过v-model把当前用户真实的名字表现出来
          .trim ： 自动去除左右空格
      -->
      <van-field v-model.trim="userprofile.name" type="text"></van-field>
    </van-popup>

    <!-- 性别弹出层(上拉菜单)
        v-model="showSex" 设置弹层是否显示
        :actions="sexMenus" 设定上拉菜单项目的
        @select="onSelect" 单击到某一个菜单项目后的回调处理：收起菜单，选中项目
        cancel-text="取消" 设置有取消按钮提示
    -->
    <van-action-sheet v-model="showSex" :actions="sexMenus" @select="onSelect" cancel-text="取消"/>

    <!-- 生日弹出层(弹出层+时间选择器) -->
    <van-popup v-model="showBirthday" position="bottom">
      <!-- 时间选择器
        type="date" ‘年月日’类型选择
        v-model="currentDate" 默认显示时间
        :min-date 最小选取时间范围 1900年
        :max-date 最大选取时间范围 当前时间
        注意：当前各个时间类型都是  new Date() 对象格式，时间选择器要求的
        @confirm="onConfirm" 单击确认按钮后的回调处理，可以获得选中的时间信息，注意不要设置()
      -->
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirm"
        @cancel="showBirthday = false"
      />
    </van-popup>
  </div>
</template>

<script>
// 导入dayjs（系统依赖包，自动去node_modules下边获取）
import dayjs from 'dayjs'

// 用户资料api、上传用户头像、保存用户资料
import {
  apiUserProfile,
  apiUserPhoto,
  apiUserSaveProfile
} from '@/api/user.js'
export default {
  name: 'user-profile',
  data () {
    return {
      // 生日选择器相关成员
      showBirthday: false, // 弹出开关
      currentDate: new Date(), // 当前默认显示时间
      minDate: new Date(1900, 0, 1), // 最小选取时间限制（月份是从0开始）
      maxDate: new Date(2100, 0, 1), // 最大选取时间限制
      // 给性别上拉菜单 配置选取项目，语法结构固定，name属性固定
      sexMenus: [{ name: '男' }, { name: '女' }],
      showSex: false, // 名称菜单层显示开关
      showName: false, // 名称弹出层显示开关
      showPhoto: false, // 头像弹出层显示开关

      // 用户资料的对象成员
      /**
          ├─ id integer 必须  用户id
          ├─ name string 必须  用户名
          ├─ photo string 必须  头像
          ├─ mobile string 必须  手机号
          ├─ gender integer 必须  性别，0-男，1-女
          ├─ birthday string 必须  生日，格式 '2018-12-20'
       */
      userprofile: {}
    }
  },
  created () {
    this.getUserProfile()
  },
  methods: {
    // 保存用户资料
    async saveProfile () {
      // 如下api成功率是100%，不用try/catch处理
      await apiUserSaveProfile(this.userprofile)
      this.$toast.success('更新资料成功！')
    },

    // 开始上传头像
    // 头像图片选取好了，该函数会自动触发执行
    async startUpload () {
      // console.dir() 可以输出元素对象的各个子成员
      // console.dir(this.$refs.mypic) // 输出上传文件域对象
      // 1. 获得上传好的图片对象
      const fobj = this.$refs.mypic.files[0]

      // 2. 把图片对象 整合到FormData
      const fd = new FormData()
      // fd整合fobj，调用append方法，不断给自己添加信息
      fd.append('photo', fobj) // photo 是接口文章要求的参数名称

      // 3. 把FormData给到api函数，提交给服务器端
      const result = await apiUserPhoto(fd)

      // 把服务器端上传好并返回的头像信息更新显示到页面上
      // 本质给到userprofile.photo
      this.userprofile.photo = result.photo
      // 关闭弹出
      this.showPhoto = false
      // 成功提示
      this.$toast.success('头像更新成功！')
    },

    // 时间选择器，确认选取时间了
    // val:就是选定好的时间
    onConfirm (val) {
      // console.log(val) // Fri Mar 10 2017 00:00:00 GMT+0800 (中国标准时间)
      // console.log(typeof val) // object
      // 现在感觉不太对，表单中收集的时间要求是 "年-月-日" 格式化样子，而我们拥有的是对象格式
      // 暂时 表单 还不能直接收集 生日信息，需要转化
      // 通过dayjs把val变为 "年-月-日" 格式，并赋值 表单生日项目
      // console.log(dayjs(val)) // dayjs对象
      this.userprofile.birthday = dayjs(val).format('YYYY-MM-DD')

      // 关闭弹出层
      this.showBirthday = false
    },
    // 性别 上拉菜单 选中项目 的回调处理
    // val: 代表被选中项目的对象数据
    onSelect (val) {
      console.log(val) // {name:'男'}
      // 对val进行处理，然后赋值给data表单成员(其接受数字的性别)
      this.userprofile.gender = val.name === '男' ? 0 : 1

      // 隐藏菜单
      this.showSex = false
    },
    // 获得资料
    async getUserProfile () {
      // data直接接收数据
      this.userprofile = await apiUserProfile()
      // 把用户生日转为 new Date()  格式，赋值给 currentDate
      // 使得选择器 默认显示
      this.currentDate = new Date(this.userprofile.birthday)
    }
  }
}
</script>

<style scoped lang='less'></style>
