"use strict";
const
  Actionable  = require('./Actionable'),
  Solution    = require('./TutorialSolution'),
  Tag         = require('./Tag'),
  Utils       = require('../utils');

class TutorialRequest extends Actionable {

  constructor() {
    super('tutorialrequests');
    this.engine = String;
    this.version = String;
    this.solutions = [Solution];
    this.tags = [Tag];
    this.permalink = String;
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
