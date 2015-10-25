"use strict";
const Utils = require('./index');

class Middlewares {

  static authenticate(req, res, next) {
    if (req.user) {
      next();
    } else if (process.env.FAUX_USER) {
      Utils.Log.warn('Faux User is activated');
      req.user = {
        username: 'bigfeet69420',
        fullName: 'MR BIG',
        save: function () {
          Utils.Log.warn('faux user fake save');
        }
      };
      next();
    } else {
      next(Utils.error.forbidden());
    }
  }

}

module.exports = Middlewares;
