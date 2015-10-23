"use strict";
const
  md5 = require('md5'),
  xss = require('xss');

class Users {

  static compile(userObject) {
    return {
      id: Users.getId(userObject),
      props: Object.assign({
        fullName: userObject.fullName
        }, userObject.customData)
    }
  }

  static getId(userObject) {
    if (userObject && userObject.username) {
      return md5(process.env.USER_HASH + userObject.username);
    } else {
      return null;
    }
  };
  static toJSON(userObject) {
    return xss(JSON.stringify(Users.compile(userObject), null, 2));
  }

}

module.exports = Users;
