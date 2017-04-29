import path from 'path';
import WarPlugin from '../index';


export default {
    entry: path.resolve('./test/src/test.js'),
    output: {
        path: path.resolve('./test/dist'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    resolve: {
        modules: [
            path.join(__dirname, 'test/src'),
            'node_modules'
        ],
        extensions: ['.js']
    },
    plugins: [
        new WarPlugin({
            outputFile: './test/dist/test.war',
            files: ['./test/src/index.html'],
            html5: ['/home', '/about']
        })
    ]
};
