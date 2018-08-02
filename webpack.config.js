const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './public/bundle.js',
    path: path.resolve(__dirname, 'public')
  }
};
