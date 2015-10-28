const
  randomWord = require('random-word-by-length'),
  sillyName = require('sillyname');

module.exports = {
  userName: function () {
    return randomWord(4) + randomWord(5);
  },
  sillyName: function () {
    return sillyName();
  }
};
