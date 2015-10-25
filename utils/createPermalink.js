const Utils = require ('./index');

module.exports = function (M, text, callback) {
  var linkName = Utils.xss(Utils.sanitize(text.toLowerCase().replace(/\s/g, '-'))),
    i = 1;
  console.log(text);
  (function loop() {
      M.loadOne({permalink:linkName}).then((m) => {
        if (m) {
          i++;
          linkName = (String(linkName + '-' + i));
          loop();
        } else {
          callback(null, linkName);
        }
      })
    .catch((err) => {
      callback(err);
    });
  })();
};
