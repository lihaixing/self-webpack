const path = require('path')
const MyPlugin = require('./plugins/plugin1.js')
module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [ path.resolve(__dirname,'./loader/loader1.js'), path.resolve(__dirname,'./loader/loader2.js')],
      },
    ],
  },
  plugins: [ new MyPlugin({ name: 'zhangsan' }) ]
}