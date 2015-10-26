"use strict";
const
  Actionable = require('./Actionable'),
  Utils    = require('../utils'),
  Comment =require('./Comment'),
  ObjectID = require('mongodb').ObjectID;

class TutorialSolution extends Actionable {
  constructor() {
    super('tutorialsolutions');
    this.linkMeta = {type: Object};
  }

  get DTO () {
    return {
      type: 'TutorialSolution',
      id: this.id,
      authorName: this.authorName,
      authorUrl: this.authorUrl,
      editorName: this.editorName,
      editorUrl: this.editorUrl,
      flags: this.flags,
      score: this.tallyVotes(),
      comments: this.comments.map((com) => {
        if (com.DTO) {
          return com.DTO;
        } else {
          return Comment.loadOne({_id: com})
            .then((m) => m.DTO)
            .catch((e) => Utils.Log.error(e));
        }
      })
    }
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
