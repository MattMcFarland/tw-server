"use strict";
const
  _ = require('lodash'),
  Actionable  = require('./Actionable'),
  Solution    = require('./TutorialSolution'),
  Comment     = require('./Comment'),
  Tag         = require('./Tag'),
  Utils       = require('../utils'),
  ObjectID = require('mongodb').ObjectID;

class TutorialRequest extends Actionable {

  constructor() {
    super('tutorialrequests');
    this.engine = String;
    this.version = String;
    this.solutions = [Solution];
    this.tags = [Tag];
    this.permalink = String;
  }
  get DTO () {

    return {
      type: "TutorialRequest",
      id: this.id,
      engine: this.engine,
      version: this.version,
      created_at: this.created_at,
      updated_at: this.updated_at,
      title: this.title,
      permalink: this.permalink,
      content: this.content,
      tags: this.tags.map((tag) => {
        return tag.DTO;
      }),
      linkMeta: this.linkMeta,
      authorName: this.authorName,
      authorUrl: this.authorUrl,
      editorName: this.editorName,
      editorUrl: this.editorUrl,
      flags: this.flags,
      score: this.tallyVotes(),
      solutions: this.solutions.map((sol) => {
        return sol.DTO;
      }),
      comments: this.comments.map((com) => {
        return com.DTO;
      }),
      removed: this.removed


    };


  }

  edit (editor, fields) {
    return new Promise((resolve, reject) => {
      var done = false;
      try {
        if (fields) {
          console.log('fields found', fields);

          this.editor = editor;
          this.updated_at = Date.now();
          this.content = fields.content ? Utils.xss(fields.content) : this.content;
          this.engine = fields.engine ? Utils.xss(fields.engine) : this.engine;
          this.version = fields.version ? Utils.xss(fields.version) : this.version;
          this.title = fields.title ? Utils.xss(fields.title) : this.title;

          if (fields.tags) {
            this.tags = Array.isArray(this.tags) ? this.tags : [];
            Utils.async.eachSeries(fields.tags.split(','), (tagName, next) => {
              Utils.async.setImmediate(() => {
                var nTag;
                if (done) {
                  next();
                } else {

                  nTag = {
                    name: tagName,
                    last_used_date: Date.now()
                  };

                  Tag.loadOneAndUpdate({name: tagName}, nTag, {upsert: true}).then((tag) => {
                    tag.times_used = tag.times_used ? tag.times_used + 1 : 1;
                    if (tag.times_used === 1) {
                      this.tags.push(tag);
                    }
                    tag.save().then(() => {
                      this.save().then(() => {
                        next();
                      }).catch((e) => reject(e));
                    }).catch((e) => reject(e));
                  });
                }
              });
            }, () => {
              done = true;
              this.save()
                .then((t) => resolve(t))
                .catch((e) => reject(e));
            });
          } else {
            this.save()
              .then((t) => resolve(t))
              .catch((e) => reject(e));
          }
        } else {
          reject("invalid fields");
        }
      } catch(e) {
        reject(e);
      }
    });
  }

  addSolution (author, data) {
    return new Promise((resolve, reject) => {
      Solution.create({
        author,
        linkMeta: data.linkMeta,
        content: Utils.xss(data.content)
      }).save().then((solution) => {
        this.solutions.push(solution);
        this.save()
          .then((s) => resolve(s))
          .catch((e) => reject(e));
      }).catch((e) => reject(e));
    });
  }

}

module.exports = TutorialRequest;
