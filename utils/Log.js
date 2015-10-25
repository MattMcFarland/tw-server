"use strict";
const chalk = require('chalk');

class Log {

  static error(msg) {
    console.trace(chalk.red('\n\n', msg, '\n\n'));
  }

  static warn(msg) {
    console.log(chalk.yellow('\n', msg, '\n'));
  }

}

module.exports = Log;
