"use strict";
const chalk = require('chalk');

class Log {

  static error(msg) {
    console.trace(chalk.red('\n\n', msg, '\n\n'));
  }

  static warn(msg) {
    console.log(chalk.yellow(msg));
  }

  static info(msg) {
    console.log(chalk.cyan(msg));
  }

}

module.exports = Log;
