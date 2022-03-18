const path = require("path")
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/main.js',
  target: ['web', 'es5'],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader', {
          loader: 'style-resources-loader',
          options: {
              patterns: [ // 只有一条时也可以写成对象形式
                  path.resolve(__dirname, './src/*.less'),
              ],
              injector: 'append' // 如果在样式文件之后导入就加此行配置
          }
      }]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.js$/,
        use: [ 'source-map-loader' ],
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { ie: '11' }}]
            ]
          }
        }
      },
      // make sure raw font files referenced from the fontawesome stylesheet are copied into dist
      // from https://chriscourses.com/blog/loading-fonts-webpack
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: 'FullCalendar Vue Example'
    })
  ]
}
