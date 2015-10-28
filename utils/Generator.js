"use strict";
const Utils = require('./index');
const data = require('./generatorData');
const dummyjson = require('dummy-json');

class Generator {

  static fauxStaticUser () {
    return Object.assign({
      save: function () {
        Utils.Log.warn('Faux Save');
      }
    }, data.staticUser)
  }

  static fauxUser (level) {
    var user = JSON.parse(dummyjson.parse(
      data.fauxUser, {
        helpers: data.helpers,
        data: {
          groupName: level === 1 ? 'user' : level === 2 ? 'moderator' : level === 3 ? 'admin' : null
        }
      }
    ));
    Utils.Log.info(JSON.stringify(user, null, 2));

    return Object.assign({
      save: function () {
        Utils.Log.warn('Faux Save');
      }
    }, user)
  }
}

module.exports = Generator;
