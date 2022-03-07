const fs = require('fs')
// 我们这里使用@babel/parser,这是 babel7 的工具,来帮助我们分析内部的语法,包括 es6,返回一个 AST 抽象语法树。
const parser = require('@babel/parser')
// Babel 提供了@babel/traverse(遍历)方法维护这 AST 树的整体状态,我们这里使用它来帮我们找出依赖模块。
const traverse = require('@babel/traverse').default
// 将 AST 语法树转换为浏览器可执行代码,我们这里使用@babel/core 和 @babel/preset-env。
const { transformFromAst } = require('@babel/core')
const path = require('path')

const Parser = {
  getAst: (path, module) => {
    // 读取入口文件
    console.log('getAst path: ', path)
    let content = fs.readFileSync(path, 'utf-8')


    // 解析loader
    const rules = module.rules || [];

    for (let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      const { test, use } = rule || {};
      let len = use.length;
      if (test.test(path)) {
        // 需要通过 loader 进行转化
        while (len > 0) {
          let loader = require(use[--len]);
          content = loader(content);
        }
      }
    }

    // 将文件内容转为AST抽象语法树
    return parser.parse(content, {
      sourceType: 'module'
    })
  },
  getDependecies: (ast, filename) => {
    const dependecies = {}
    // 遍历所有的 import 模块,存入dependecies
    traverse(ast, {
      // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename)
        // 保存依赖模块路径,之后生成依赖关系图需要用到
        const filepath = path.join(dirname, node.source.value)
        dependecies[node.source.value] = filepath
      }
    })
    return dependecies
  },
  getCode: ast => {
    // AST转换为code
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    })
    return code
  }
}

module.exports = Parser;