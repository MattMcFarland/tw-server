"use strict";
const

  _             = require('lodash'),
  Utils         = require('../utils'),
  Comment       = require('./Comment');

module.exports = Utils.ModelFactory.fabricate({
  name: 'TutorialSolution',
  type: 'tutorialsolution',
  props: {
    processing: { type: Boolean },
    content: {type: String},
    version:    { type: String },
    linkMeta:   { type: Object }
  },
  methods: {
    DTO (user) {
      return {
        type: 'TutorialSolution',
        collection: "solutions",
        content: this.content,
        title: this.linkMeta.title,
        id: this._id,
        linkMeta: this.linkMeta,
        authorName: this.getAuthorName(),
        authorUrl: this.getAuthorUrl(),
        authorAvatar: this.getAuthorAvatar(),
        editorName: this.getEditorName(),
        editorUrl: this.getEditorUrl(),
        editorAvatar: this.getEditorAvatar(),
        flags: this.getFlags(),
        score: this.tallyVotes(),
        userVote: this.getUserVote(user),
        userFlags: this.getUserFlags(user),
        comments: this.comments.map((com) => {
          return com.DTO ? com.DTO(user) : com;
        }),
        userPrivs: this.getUserPrivs(user),
        removed: this.removed,
        isOwner: this.checkOwnership(Utils.Users.getId(user))
      }
    },

    edit (data) {
      return new Promise((resolve, reject) => {
        if (data) {
          //console.log('data found', data);

          this.editor = data.editor;
          this.updated_at = Date.now();
          this.content = data.content ? Utils.xss(data.content) : this.content;
          this.linkMeta = data.linkMeta ? data.linkMeta : this.linkMeta;


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
}).model;
