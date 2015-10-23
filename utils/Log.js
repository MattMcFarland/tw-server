"use strict";
const chalk = require('chalk');

class Log {

  static error(msg) {
    console.trace(chalk.red('\n\n', msg, '\n\n'));
  }

}

module.exports = Log;
