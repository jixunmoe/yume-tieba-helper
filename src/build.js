var fs = require ('fs'),
	_build = __dirname + '/build';

var build = parseInt(fs.readFileSync (_build), 10);
build ++ ;
fs.writeFileSync (_build, build);
module.exports = build.toString();