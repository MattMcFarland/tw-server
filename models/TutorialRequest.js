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
    this.version =String;
    this.solutions = [Solution];
    this.tags = [Tag];
  }

  edit (editor, fields, callback) {
    var self = this,
      done = false,
      tutRequest = this,
      timestamp = new Date().toISOString();

    if (fields) {
      this.editor = editor;
      this.updated_at = timestamp;
      this.content = fields.content ? Utils.xss(fields.content) : this.content;
      this.engine = fields.engine ? Utils.xss(fields.engine) : this.engine;
      this.version = fields.version ? Utils.xss(fields.version) : this.version;
      this.title = fields.title ? Utils.xss(fields.title) : this.title;
      if (fields.tags) {
        this.tags = [];
        Utils.async.eachSeries(fields.tags.split(','), function iterator(tagName, next) {
          console.log('proccessing tag', tagName);
          async.setImmediate(function () {
            if (!done) {
              Tag.findOne({name: tagName}, function (err, tag) {
                console.log(err, tag);
                if (!err && tag) {
                  (function () {
                    tag.last_used_date = timestamp;
                    if (!tag.count) {
                      tag.count = 1;
                    } else {
                      tag.count++;
                    }
                    console.log('use existing tag', tagName);
                    tag.save();
                    tutRequest.tags.push(tag);
                    tutRequest.save();
                  })();
                } else {
                  (function () {
                    var newTag = new Tag();
                    newTag.name = tagName;
                    newTag.count = 1;
                    newTag.last_used_date = timestamp;
                    newTag.save();
                    tutRequest.tags.push(newTag);
                    tutRequest.save();
                    console.log('create new tag', newTag.name);
                  })();
                }
                setTimeout(function () {
                  next();
                }, 100);
              });
            } else {
              setTimeout(function () {
                next();
              }, 100);
            }
          });
        }, function() {
          done = true;
          self.save();
          setTimeout(function () {
            callback(null, tutRequest);
          }, 100);
        });
      } else {
        done = true;
        this.save();
        callback(null, tutRequest);
      }
    } else {
      callback("invalid fields", null);
    }
  }

  addSolution (author, data, callback) {
    var solution = new Solution();
    try {
      solution.author = author;
      solution.linkMeta = data.linkMeta;
      solution.content = Utils.xss(data.content);
      solution.save();
      this.solutions.push(solution);
      this.save();
      callback(null, solution);
    } catch (e) {
      Utils.Log.error(e);
    }
  }

}

module.exports = TutorialRequest;
