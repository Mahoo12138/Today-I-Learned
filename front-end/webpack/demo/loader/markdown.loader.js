// module.exports = (source) => {
//   console.log(source)
//   return "console.log('hello loader!')"
// }



const { marked } = require('marked')

// module.exports = source => {
//   //1.将 markdown 转换为 html 字符串
//   const html = marked(source)
//   //2. 将 html 字符串拼接为一段导出字符串的 JS 代码
//   const code = `module.exports = ${JSON.stringify(html)}`
//   return code
// }


module.exports = source => {
  //1.将 markdown 转换为 html 字符串
  const html = marked(source)
  //2. 将 html 字符串拼接为一段导出字符串的 JS 代码
  return html
}