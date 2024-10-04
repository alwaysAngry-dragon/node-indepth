const path = require('path');

module.exports = {
  entry: './public/js/index.js', // Entry point for your main JS file
  output: {
    filename: 'bundle.js', // Output file name
    path: path.resolve(__dirname, 'public/js'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply Babel to JS files
        exclude: /node_modules/, // Exclude node_modules directory
        use: {
          loader: 'babel-loader', // Use Babel loader
        },
      },
    ],
  },
  devtool: 'inline-source-map', // Use a devtool that doesn't rely on eval
};
