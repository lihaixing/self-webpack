// @ts-nocheck
const fs = require('fs')
const path = require('path')
const Parser = require('./parser.js') 
const { SyncHook } = require('tapable');


const options = require('../webpack.config')



// 1. 定义 Compiler 类
class Compiler {
  constructor(options) {
    // webpack 配置
    const { entry, output ,plugins,module} = options
    // 入口
    this.entry = entry
    // 出口
    this.output = output
    // 模块
    this.modules = [];

    // loader使用
    this.module = module;
    // 插件
    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      emit: new SyncHook(),
      done: new SyncHook()
    };
    // 解析plugins 通过tapable
    if (Array.isArray(plugins)) {
      plugins.forEach(plugin => {
        plugin.apply(this);
      });
    }
    this.hooks.afterPlugins.call();
  }
  // 构建启动
  run() {
    this.hooks.run.call();
    // 5. 递归解析所有依赖项,生成依赖关系图
    // 解析入口文件
    const info = this.build(this.entry)
    this.modules.push(info)
    this.modules.forEach(({ dependecies }) => {
      // 判断有依赖对象,递归解析所有依赖项
      if (dependecies) {
        for (const dependency in dependecies) {
          this.modules.push(this.build(dependecies[dependency]))
        }
      }
    })
    this.hooks.afterCompile.call()
    // 生成依赖关系图
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        // 使用文件路径作为每个模块的唯一标识符,保存对应模块的依赖对象和文件内容
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    );
    // 6. 重写 require 函数,输出 bundle
    this.generate(dependencyGraph)
  }
  build(filename) {
    const { getAst, getDependecies, getCode } = Parser
    // 2. 解析入口文件,获取 AST
    const ast = getAst(filename ,this.module)
    // 3. 找出所有依赖模块
    const dependecies = getDependecies(ast, filename)
    // 4. AST 转换为 code
    const code = getCode(ast)
    return {
      // 文件路径,可以作为每个模块的唯一标识符
      filename,
      // 依赖对象,保存着依赖模块路径
      dependecies,
      // 文件内容
      code
    }
  }
  // 重写 require函数 (浏览器不能识别commonjs语法),输出bundle

  generate(code) {
    // 输出文件路径
    const filePath = path.join(this.output.path, this.output.filename)
    // 懵逼了吗? 没事,下一节我们捋一捋
    const bundle = `(function(graph){
      function require(module){
        function localRequire(relativePath){
          return require(graph[module].dependecies[relativePath])
        }
        var exports = {};
        (function(require,exports,code){
          eval(code)
        })(localRequire,exports,graph[module].code);
        return exports;
      }
      require('${this.entry}')
    })(${JSON.stringify(code)})`

    // 把文件内容写入到文件系统
    fs.writeFileSync(filePath, bundle, 'utf-8')
  }
}

new Compiler(options).run()