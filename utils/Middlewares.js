"use strict";
const Utils = require('./index'),
  ObjectID = require('mongodb').ObjectID;

var testCache = {};

class Middlewares {

  /**
   * Authenticate Middleware
   * @param level {Number}  1: user, 2: moderator, 3: admin
   * @param M {Model} Model object to test ownership
   * @param owner {Boolean} is owner authorized? (default true)
   * @returns {Function} Middleware
   */
  static authenticate(level, M, owner) {

    level || (level = 1);
    owner = (typeof owner === "undefined") ? true : owner;

    return function (req, res, next) {
      var id = req.params.id;
      var access = false;
      //console.log('checking account auth...');
      if (req.user) {
        //console.log('Found user ' + req.user.username);
        if (req.user.groups && typeof req.user.groups.items &&
          req.user.groups.items[0] &&
          req.user.groups.items[0].name) {
          req.usergroup = req.user.groups.items[0].name;
          req.accessLevel = req.usergroup === "moderators" ? 2 : req.usergroup === "admins" ? 3 : 1;
        }
        //console.log('usergroup', req.usergroup);
        //console.log('accessLevel', req.accessLevel);
        //console.log('level required', level);
        ////console.log(req.accessLevel);
        access = (req.accessLevel >= level);
        //console.log('User access: ' + access);
        if (!req.user.customData.uid) {
          req.user.customData.uid = Utils.Users.getId(req.user);

          req.user.save();
        }
      }
      // check if access granted by user group.
      if (access) {
        next();
        // check if access granted by ownership.
      }  else if (req.user && owner && id && M) {
        //////console.log('check for ownership', id);

        M.findById(id)
          .then((mod) => {
            if (mod.checkOwnership(Utils.Users.getId(req.user))) {
              next();
            } else {
              //console.log('access denied');
              next(Utils.error.forbidden());
            }
          }).catch((e) => {
            Utils.Log.error(e);
            next(Utils.error.badRequest(e))
          });
      } else if (!access) {
        next(Utils.error.forbidden());
      }
    }
  }

  /**
   * Faux User Middleware - Generate fake user for the request
   * @param level {Number} 1: user, 2: moderator, 3: admin, 4: fauxStaticUser.hbs
   * @param cache {Boolean} Setting to true persists fauxUser.
   * @returns {Function}
   */
  static fauxUser(level, cache) {
    const fauxUser = () => {
      return level === 5 ? Utils.Generator.fauxStaticUser() : Utils.Generator.fauxUser(level);
    };
    cache || (cache = true);
    if (cache) {
      testCache = fauxUser();
    }
    return function (req, res, next) {
      if (cache && testCache) {
        req.user = testCache;
      }
      if (!req.user) {
        req.user = fauxUser();
      }
      req.usergroup = req.user.groups.items[0].name;
      //console.log(req.user.username + ':' + req.usergroup);
      Utils.Log.warn('fauxUser Middleware is active, disable to use real auth');
      next();
    }
  }

  static timeOut() {
    return function (req, res, next) {
      if (!req.timedout) {
        next();
      } else {
        res.json ({
          name: "TooBusy",
          info: "Network Timeout",
          status: 503
        });
      }
    }
  }
}

module.exports = Middlewares;
