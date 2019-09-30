const path = require('path');
const webpack = require('webpack');

const paths = {
  appSrc: 'src/embed',
}

module.exports = {
  entry: './src/embed/index.ts',
  devServer: {
    contentBase: path.join(__dirname, '..', '..', 'dist'),
    compress: true,
    inline: true,
    disableHostCheck: true,
    port: 9001,
    index: path.join(__dirname, '..', '..', 'dist', 'index-embed.html'),
  },
  plugins: [
    new webpack.DefinePlugin({
      ENVIRONMENT: JSON.stringify(process.env.NODE_ENV),
    })
  ],
  module: {
    rules: [
      {
        test: /\.(tsx?)$/,
        include: path.join(__dirname, '..', '..', 'src/embed'),
        exclude: /(node_modules)/,
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.(scss|sass)$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader"
        }]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              disable: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [{
            loader: "style-loader"
        }, {
            loader: "css-loader"
        }]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      'actions': path.resolve(__dirname, '..', '..', `${paths.appSrc}/actions`),
      'api': path.resolve(__dirname, '..', '..', `${paths.appSrc}/api`),
      'audio': path.resolve(__dirname, '..', '..', `${paths.appSrc}/audio`),
      'components': path.resolve(__dirname, '..', '..', `${paths.appSrc}/components`),
      'config': path.resolve(__dirname, '..', '..', `${paths.appSrc}/config`),
      'constants': path.resolve(__dirname, '..', '..', `${paths.appSrc}/constants`),
      'containers': path.resolve(__dirname, '..', '..', `${paths.appSrc}/containers`),
      'images': path.resolve(__dirname, '..', '..', `${paths.appSrc}/images`),
      'modules': path.resolve(__dirname, '..', '..', `${paths.appSrc}/modules`),
      'utils': path.resolve(__dirname, '..', '..', `${paths.appSrc}/utils`),
      'shared': path.resolve(__dirname, '..', '..', `src/shared`),
    }
  }
};
