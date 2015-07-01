/* global require, module */

var compileSass = require('broccoli-sass'),
    cssTree = compileSass(['src/styles'], 'app.scss', 'assets/app.css');

var injectLivereload = require('broccoli-inject-livereload'),
    htmlTree = injectLivereload('src/html');

var concat = require('broccoli-concat'),
    jsTree = concat('src/scripts', {
      inputFiles: ['app.js', 'test.js'],
      outputFile: '/assets/app.js'
    });

var uglifyJs = require('broccoli-uglify-js'),
    uglifiedJsTree = uglifyJs(jsTree, {});

var mergeTrees = require('broccoli-merge-trees'),
    finalTree = mergeTrees([cssTree, htmlTree, uglifiedJsTree]);

module.exports = finalTree;
