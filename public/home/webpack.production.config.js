const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const pkg = require('./package.json');
const webpack = require('webpack');

module.exports = function(webpackConfig) {
    webpackConfig.resolve.root = [
        path.join(__dirname, 'src'),
    ];

    webpackConfig.plugins.unshift(new SpritesmithPlugin({
        src: {
            cwd: path.resolve(__dirname, 'resource/images/uaIcon'),
            glob: '*.png'
        },
        target: {
            image: path.resolve(__dirname, 'resource/images/uaIcon-sprite.png'),
            css: path.resolve(__dirname, 'src/less/uaIcon-sprite.less')
        },
        apiOptions: {
            cssImageRef: "../../resource/images/uaIcon-sprite.png"
        }
    }));

    webpackConfig.babel.plugins.push('antd');

    // eslint-disable-next-line no-param-reassign
    webpackConfig.output.publicPath = `/${pkg.version}/`;

    webpackConfig.plugins.push(new HtmlWebpackPlugin({
        filename: '../index.html',
        template: './index_template.ejs',
        minify: {
            collapseWhitespace: false,
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
        },
    }));

    /*
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    );
    */

    // Fix ie8 compatibility
    webpackConfig.module.loaders.unshift({
        test: /\.jsx?$/,
        loader: 'es3ify-loader',
    });

    return webpackConfig;
};
