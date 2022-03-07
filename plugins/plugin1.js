class MyPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // 定义个 apply 方法
    // 同步的 hook ,采用 tap,第二个函数参数只有 compilation 参数
    compiler.hooks.afterCompile.tap('demo plugin', (compilation) => {
      console.log('compilation', compilation)
      //插件的 hooks
      console.info(this.options); // 插件处理逻辑
    });
  }
}
module.exports = MyPlugin;