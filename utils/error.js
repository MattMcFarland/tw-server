
exports.badRequest = function (info) {
  var err = new Error("Bad Request");
  err.info = info || "";
  err.status = 400;
  console.log(err);
  return err;
};


exports.forbidden = function (info) {
  var err = new Error("Forbidden");
  err.info = info || "";
  err.status = 403;
  console.log(err);
  return err;
};


exports.notFound = function (info) {
  var err = new Error("NotFound");
  err.info = info || "";
  err.status = 404;
  console.log(err);
  return err;
};








exports.misc = function (name, code, info) {
  var err = new Error(name);
  err.info = info || "";
  err.status = code;
  console.log(err);
  return err;
};
