"use strict";
const
  Actionable = require('./Actionable'),
  Utils    = require('../utils'),
  ObjectID = require('mongodb').ObjectID;

class TutorialSolution extends Actionable {
  constructor() {
    super('tutorialsolutions');
    this.linkMeta = {type: Object};
  }

  edit (editor, fields) {
    return new Promise((resolve, reject) => {
      this.editor = editor;
      this.updated_at = Date.now();
      this.content = fields.content ? Utils.xss(fields.content) : this.content;
      this.linkMeta = fields.linkMeta ? fields.linkMeta : this.linkMeta;
      this.title = fields.title ? Utils.xss(fields.title) : this.title;
      this.save()
        .then(sol => resolve(sol))
        .catch(e => reject(e))
    });
  }


}

module.exports = TutorialSolution;
