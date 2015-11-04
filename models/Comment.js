"use strict";
const Utils = require('../utils');

module.exports = Utils.ModelFactory.fabricate({
  name: 'Comment',
  type: 'comment',
  props: {
    message: {type: String, required: true }
  },
  methods: {
    DTO (user) {
      return {
        type: 'Comment',
        collection: "comments",
        id: this._id,
        authorName: this.getAuthorName(),
        authorUrl: this.getAuthorUrl(),
        editorName: this.getEditorName(),
        editorUrl: this.getEditorUrl(),
        created_at: this.created_at,
        updated_at: this.updated_at,
        message: this.message,
        flags: this.getFlags(),
        score: this.tallyVotes(),
        userVote: this.getUserVote(user),
        userFlags: this.getUserFlags(user),
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
          this.message = data.message ? Utils.xss(data.message) : this.message;

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
    }
  }
});
