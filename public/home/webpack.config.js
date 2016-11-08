const path = require('path');
const SpritesmithPlugin = require('webpack-spritesmith');

module.exports = function(webpackConfig) {

    webpackConfig.resolve.root = [
        path.join(__dirname, 'src'),
    ];

    webpackConfig.output.publicPath = '/';

    webpackConfig.babel.plugins.push('antd');

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


    // Fix ie8 compatibility
    webpackConfig.module.loaders.unshift({
        test: /\.jsx?$/,
        loader: 'es3ify-loader',
    });

    webpackConfig.module.loaders = [{
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: webpackConfig.babel,
    }, {
        test(filePath) {
            return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
        },
        loader: 'style!css!postcss!less-loader',
    }, {
        test: function test(filePath) {
            return (/\.css$/.test(filePath) && !/\.module\.css$/.test(filePath)
            );
        },
        loader: 'style!css!postcss',
    }, {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff'
    }, {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/font-woff'
    }, {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=application/octet-stream'
    }, {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file',
    }, {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&minetype=image/svg+xml',
    }, {
        test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i, loader: 'url?limit=10000',
    }, {
        test: /\.json$/, loader: 'json',
    }, {
        test: /\.html?$/, loader: 'file?name=[name].[ext]',
    }];

    return webpackConfig;
};
