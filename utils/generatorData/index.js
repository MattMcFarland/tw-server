var fs = require('fs');
exports.fauxUser = fs.readFileSync('utils/generatorData/fauxUser.hbs', {encoding: 'utf8'});
exports.staticUser = require('./fauxStaticUser.json');
exports.helpers = require('./helpers');
