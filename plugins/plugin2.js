class CopyRightWebpackPlugin {
  apply(compiler) {
    // 异步的 hook ,采用 tap,第二个函数参数有 compilation 跟 cb 参数,一定要调用 cb()
    compiler.hooks.emit.tapAsync(
      'CopyrightWebpackPlugin',
      (compilation, cb) => {
        compilation.assets['copyright.txt'] = {
          source() {
            return 'copyright by webInRoad';
          },
          size() {
            return 11;
          },
        };
        cb();
      }
    );
  }
}
module.exports = CopyRightWebpackPlugin;