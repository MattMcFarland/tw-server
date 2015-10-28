const Utils = ('./index');
exports.badRequest = function (info) {
  Utils.Log.error(info);
  return {
    name: "BadRequest",
    info: info || "Bad Request",
    status: 400
  };
};


exports.forbidden = function (info) {
  Utils.Log.error(info);
  return {
    name: "Forbidden",
    info: info || "Authentication Failure",
    status: 403
  };
};


exports.notFound = function (info) {
  Utils.Log.error(info);
  return {
    name: "NotFound",
    info: info || "Not Found",
    status: 404
  };
};








exports.misc = function (name, code, info) {
  var err = new Error(name);
  err.info = info || "";
  err.status = code;
  return err;
};
