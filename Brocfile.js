/* global require, module */

var compileSass = require('broccoli-sass'),
    mergeTrees = require('broccoli-merge-trees'),
    cssTree = compileSass(['src/styles'], 'app.scss', 'assets/app.css');

module.exports = mergeTrees([cssTree, 'src/html']);
