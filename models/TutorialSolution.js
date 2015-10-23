"use strict";
const
  Actionable = require('./Actionable'),
  Utils    = require('../utils');

class TutorialSolution extends Actionable {
  constructor() {
    super('tutorialsolutions');
    this.linkMeta = {type: Object};
  }

  edit (editor, fields, callback) {
    try {
      this.editor = editor;
      this.updated_at = new Date().toISOString();
      this.content = fields.content ? Utils.xss(fields.content) : this.content;
      this.linkMeta = fields.linkMeta ? fields.linkMeta : this.linkMeta;
      this.title = fields.title ? Utils.xss(fields.title) : this.title;
      this.save((i) => callback(null, i));
    } catch(e) {
      Utils.Log.error(e);
      callback(e);
    }
  }


}

module.exports = TutorialSolution;
