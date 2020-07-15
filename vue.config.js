module.exports = {
  lintOnSave: false,
  devServer: {
    open: true,
    port: '12233' // 端口 ，默认是8080，范围1~65535
  },
  // 使得打包好的静态资源文件通过./当前目录寻找，
  // 好处是:打包好的dist目录文件通过浏览器可以执行运行
  // (默认是/根地址，这样打包好的项目必须通过http服务访问)
  publicPath: './'
}
