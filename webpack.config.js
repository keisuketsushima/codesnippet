const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    contentscript: path.join(__dirname, 'src', 'contentscript.js'),
    search: path.join(__dirname, 'src', 'search.js'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {from: 'public', to: '.'},
        {from: 'src/search.html', to: '.'},
      ]
    }),
    new HtmlWebpackPlugin({
      filename: 'search.html',
      template: path.join(__dirname, 'src', 'search.html'),
      inject: false
    })
  ]
};