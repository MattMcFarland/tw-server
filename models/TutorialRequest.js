"use strict";
const
  _             = require('lodash'),
  mongoose      = require('mongoose'),
  deepPopulate  = require('mongoose-deep-populate')(mongoose),
  Schema        = mongoose.Schema,
  Solution      = require('./TutorialSolution'),
  Comment       = require('./Comment'),
  Tag           = require('./Tag'),
  Utils         = require('../utils');

var tutorialRequest = Utils.ModelFactory.fabricate({
  name: 'TutorialRequest',
  type: 'tutorialRequest',
  props: {
    title: {type: String},
    content: {type: String},
    engine:    { type: String },
    version:   { type: String },
    permalink: { type: String },
    category: { type: String },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    solutions: [{ type: Schema.Types.ObjectId, ref: 'TutorialSolution' }]
  },
  methods: {
    DTO (user) {
      return {
        type: "TutorialRequest",
        category: this.category,
        id: this.id,
        engine: this.engine,
        version: this.version,
        created_at: this.created_at,
        updated_at: this.updated_at,
        title: this.title,
        permalink: this.permalink,
        content: this.content,
        tags: this.tags.map((tag) => {
          //console.log('tag???', tag)
          return tag.DTO ? tag.DTO() : tag;
        }),
        authorName: this.getAuthorName(),
        authorUrl: this.getAuthorUrl(),
        editorName: this.getEditorName(),
        editorUrl: this.getEditorUrl(),
        flags: this.getFlags(),
        score: this.score || 0,
        userVote: this.getUserVote(user),
        userFlags: this.getUserFlags(user),
        solutions: this.solutions.map((sol) => {
          return sol.DTO ? sol.DTO(user) : sol;
        }),
        comments: this.comments.map((com) => {
          return com.DTO ? com.DTO(user) : com;
        }),
        removed: this.removed,
        userPrivs: this.getUserPrivs(user),
        isOwner: this.checkOwnership(Utils.Users.getId(user))
      };
    },

    edit (data) {
      return new Promise((resolve, reject) => {
          if (data) {
            //console.log('data found', data);

            this.editor = data.editor;
            this.updated_at = Date.now();
            this.content = data.content ? Utils.xss(data.content) : this.content;
            this.engine = data.engine ? Utils.xss(data.engine) : this.engine;
            this.version = data.version ? Utils.xss(data.version) : this.version;
            this.title = data.title ? Utils.xss(data.title) : this.title;
            this.tags = data.tags ? data.tags : this.tags;

              this.save((err, doc) => {
                if (err) {
                  reject(err);
                } else if (doc) {
                  resolve(doc);
                } else {
                  reject('404');
                }
              })
          } else {
            reject("invalid data");
          }
      });
    },
    addSolution (author, data) {
      return new Promise((resolve, reject) => {
        var newSolution = new Solution();
        newSolution.author = author;
        newSolution.linkMeta = data.linkMeta;
        newSolution.content = Utils.xss(data.content);
        newSolution.save()
          .then((sol) => {
            return this.solutions.push(sol);
          })
          .then((sol) => {
            return this.save()
          })
          .then((sol) => {
            resolve(newSolution)
          })
      });
    },

    addComment (author, message) {
      return new Promise((resolve, reject) => {
        var newComment = new Comment();
        newComment.author = author;
        newComment.message = Utils.xss(message);
        newComment.save()
          .then((com) => {
            return this.comments.push(com);
          })
          .then((com) => {
            return this.save()
          })
          .then((com) => {
            resolve(newComment)
          })
      });
    }
  }
});

tutorialRequest.schema.plugin(deepPopulate);
module.exports = tutorialRequest.model;
