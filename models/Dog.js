"use strict";
const Document = require('camo').Document;

class Dog extends Document {
  constructor() {
    super('dogs');

    this.name = String;
    this.breed = String;
  }
}

module.exports = Dog;
