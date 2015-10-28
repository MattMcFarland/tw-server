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
      console.log(owner);
      var uid = Utils.Users.getId(req.user);
      var id = req.params.id;
      var access = false;
      if (req.user) {
        if (req.user.groups && typeof req.user.groups.items &&
          req.user.groups.items[0] &&
          req.user.groups.items[0].name) {
          req.usergroup = req.user.groups.items[0].name;
          req.accessLevel = req.usergroup === "user" ? 1 : req.usergroup === "moderator" ? 2 : req.usergroup === "admin" ? 3 : 0;
        }
        console.log(req.accessLevel);
        access = (req.accessLevel >= level);
      }
      // check if access granted by user group.
      if (access) {
        next();
        // check if access granted by ownership.
      }  else if (req.user && owner && id && M) {
        console.log('check for ownership', id);

        M.loadOne({_id: ObjectID(id)})
          .then((mod) => {
            if (mod.checkOwnership(uid)) {
              next();
            } else {
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
      Utils.Log.info(req.user.username + ':' + req.usergroup);
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
