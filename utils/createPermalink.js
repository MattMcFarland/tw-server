const Utils = require ('./index');

module.exports = function (M, text) {
  return new Promise((resolve, reject) => {
    var linkName = Utils.xss(Utils.sanitize(text.toLowerCase().replace(/\s/g, '-')));
    (function loop() {
      M.findOne({permalink:linkName})
        .then((m) => {
          if (m) {
            if (/.*-([\d]*)$/.test(linkName)) {
              linkName = linkName.replace(/([\d]*)$/, parseInt(linkName.replace(/.*-([\d]*)$/, `$1`)) + 1);
            } else {
              linkName += '-1';
            }
            loop();
          } else {
            resolve(linkName);
          }
        })
        .catch(err => reject(err));
    })();
  });

};
