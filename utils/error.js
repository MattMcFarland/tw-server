
exports.badRequest = function (info) {
  var err = new Error('BadRequest');
  err.status = 400;
  return(err);
};


exports.forbidden = function (info) {
  var err = new Error('forbidden');
  err.status = 403;
  return(err);
};


exports.notFound = function (info) {
  var err = new Error('notFound');
  err.status = 404;
  return(err);
};







exports.misc = function (name, code, info) {
  var err = new Error(name);
  err.info = info || "";
  err.status = code;
  return err;
};
