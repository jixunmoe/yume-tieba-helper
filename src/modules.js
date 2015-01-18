var modDir = __dirname + '/mod/';
var fs = require ('fs');

var ret = [];
fs.readdirSync (modDir).forEach (function (m) {
	ret.push ('"' + m.slice(0, -3) + '": ' + fs.readFileSync (modDir + m));
});

module.exports = ret.join (',\n');