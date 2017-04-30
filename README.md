# war-webpack-plugin [![npm](https://img.shields.io/npm/v/war-webpack-plugin.svg?style=flat-square)](https://github.com/isonet/war-webpack-plugin)[![licence](https://img.shields.io/npm/l/war-webpack-plugin.svg?style=flat-square)](https://img.shields.io/npm/l/war-webpack-plugin.svg)

[NPM registry](https://www.npmjs.com/package/war-webpack-plugin)

Generate a Tomcat war from your webpack build result!

## Installation

### Install with NPM

```npm install --save-dev war-webpack-plugin```

## Usage

```ecmascript 6
import WarPlugin from 'war-webpack-plugin';

...

plugins: [
        new WarPlugin({
            outputFile: './dist/test.war',
            files: ['./src/index.html'],
            html5: { 
                paths: ['/home', '/about'],
                jarUrl: 'MY_LOCAL_NEXUS_URL/urlrewritefilter-4.0.3.jar',
                description: 'My awesome web app',
                displayName: 'AwesomeApp'
            }
        })
    ]
```

### Options

|Name|Type|Required|Description|
|:--:|:--:|:------:|:----------|
|**`outputFile`**|`{String}`|:heavy_check_mark:|File location of the generated war, relative to your webpack config file.|
|**`files`**|`{Array} of {String}`||Optional files to include in the war, this could be your index.html.|
|**`html5`**|`{Object}`||Support for SPA apps using url rewitres. See [https://docs.angularjs.org/guide/$location#html5-mode](AngularJs HTML5 mode) for more details.|
|**`html5.paths`**|`{Array} of {String}`||Paths to rewrite to index.html.|
|**`html5.jarUrl`**|`{String}`||If you would like to specifiy another location for tuckey's urlrewrite jar, eg. from your Nexus repository.|
|**`html5.description`**|`{String}`||War application description.|
|**`html5.dsiplayName`**|`{String}`||War application name.|

## License

MIT

