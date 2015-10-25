/**
 * @method Utils.sanitize
 * @summary Sanitize a string by removing all characters except alphanumberic and dashes.
 * @param str {string} string to sanitize.
 * @returns string Sanitized string..
 */
module.exports = function (str) {
  return str.replace(/[^a-z0-9 -]/gi, '');
};
