module.exports = {
    entry: './src/main.js',
    mode: 'development',
    output: {
        path: `${__dirname}/dist`,
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: `${__dirname}/dist`,
        compress: true,
        port: 1234,
    },
};