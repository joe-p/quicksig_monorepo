const path = require('path')
const webpack = require('webpack')

module.exports = {

    // bundling mode
    mode: 'production',

    devtool: 'source-map',

    // entry files
    entry: {
        index: './src/index.ts',
    },
    
    // output bundles (location)
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },

    // file resolutions
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer")
        }
    },

    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    
    // loaders
    module: {
        rules: [
            {
                test: /\.tsx?/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    }
};