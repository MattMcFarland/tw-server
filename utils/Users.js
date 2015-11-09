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
    if (userObject) {
      if (!userObject.href) {
        return('dummy');
      }

      let parts = userObject.href.split('/');
      return (parts[parts.length -1 ]);

    } else {
      return null;
    }
  };
  static toJSON(userObject) {
    return xss(JSON.stringify(Users.compile(userObject), null, 2));
  }

}

module.exports = Users;
