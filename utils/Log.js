"use strict";
const chalk = require('chalk');

class Log {

  static error(msg) {
    console.trace(chalk.red('\n', 'ERROR: ' + msg, '\n'));
  }

  static warn(msg) {
    //console.log(chalk.yellow('Warning: ' + msg));
  }

  static info(msg) {
    //console.log(chalk.cyan('Info: ' + msg));
  }

}

module.exports = Log;
