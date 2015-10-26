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
      solutions: this.solutions.map((sol) => {
        return sol.DTO;
      }),
      id: this.id,
      title: this.title,
      linkMeta: this.linkMeta,
      authorName: this.authorName,
      authorUrl: this.authorUrl,
      editorName: this.editorName,
      editorUrl: this.editorUrl,
      flags: this.flags,
      score: this.tallyVotes(),
      comments: this.comments.map((com) => {
        return com.DTO;
      })
    };


  }

  edit (editor, fields) {
    return new Promise((resolve, reject) => {
      var done = false,
        timestamp = Date.now();

      if (fields) {
        this.editor = editor;
        this.updated_at = timestamp;
        this.content = fields.content ? Utils.xss(fields.content) : this.content;
        this.engine = fields.engine ? Utils.xss(fields.engine) : this.engine;
        this.version = fields.version ? Utils.xss(fields.version) : this.version;
        this.title = fields.title ? Utils.xss(fields.title) : this.title;

        if (fields.tags) {
          this.tags = Array.isArray(this.tags) ? this.tags : [];
          Utils.async.eachSeries(fields.tags.split(','), (tagName, next) => {
            async.setImmediate(() => {
              if (done) {
                next();
              } else {
                Tag.loadOne({name: tagName}).then((tag) => {
                  if (tag) {
                    tag.last_used_date = timestamp;
                    tag.count = (!tag.count) ? 1 : tag.count + 1;
                    tag.save()
                      .then(() => {
                        this.tags.push(tag);
                        this.save().then(() => {
                          next();
                        }).catch((e) => reject(e));
                      }).catch((e) => reject(e));
                  } else {
                    Tag.create({
                      name: tagName,
                      count: 1,
                      last_used_date: timestamp
                    }).save()
                      .then(() => {
                        this.tags.push(tag);
                        this.save().then(() => {
                          next();
                        }).catch((e) => reject(e));
                      }).catch((e) => reject(e));
                  }
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
