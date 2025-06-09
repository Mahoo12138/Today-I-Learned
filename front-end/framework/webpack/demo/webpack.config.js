module.exports = {
  // entry: "./src/main.css",
  entry: "./src/markdown/main.js",

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.md$/,
        // use: './loader/markdown.loader'
        use: ["html-loader", './loader/markdown.loader']
      }
    ]
  }
}