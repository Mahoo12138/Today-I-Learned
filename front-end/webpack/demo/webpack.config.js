module.exports = {
  entry: "./src/main.css",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: "css-loader"
      }
    ]
  }
}