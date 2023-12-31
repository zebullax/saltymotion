const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// Saltymotion assets
//
// assetFolder/dist : html + js + css
//            /images : icons and not s3 hosted pictures
const assetRootPath = process.env.SALTYMOTION_ASSET_ROOT_PATH;
const bundleRootPath = path.resolve(assetRootPath, "dist");
const basePath = path.resolve(__dirname);

module.exports = {
  watch: process.env.NODE_ENV !== "production",
  mode: process.env.NODE_ENV !== "production" ? "development" : "production",
  devtool: process.env.NODE_ENV !== "production" ? "eval-cheap-module-source-map" : false,
  context: basePath,
  entry: {
    app: "./src/app.jsx",
  },
  output: {
    filename: "dist/[name].[contenthash].js",
    path: assetRootPath,
    publicPath: "/",
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_PROD: process.env.NODE_ENV === "production",
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: "dist/index.html",
      template: "!!pug-loader!template/views/index.pug",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: "./stylesheets/style.css",
          to: path.normalize(path.join(bundleRootPath, "/style.css")),
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        resolve: {
          extensions: [".js", ".jsx"],
        },
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
