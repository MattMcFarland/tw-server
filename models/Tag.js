"use strict";
const ModelFactory = require('../utils/ModelFactory');
const Utils = require('../utils');




module.exports = ModelFactory.fabricate({
  name: 'Tag',
  type: 'tag',
  props: {
    times_used: { type: Number, default: 1},
    name: {type: String },
    last_used_date: { type: Date, default: Date.now },
    is_pending: { type: Boolean, default: true },
    is_approved: { type: Boolean, default: false }
  },
  methods: {
    DTO () {
      return {
        id: this._id,
        name: this.name,
        authorName: this.getAuthorName(),
        authorUrl: this.getAuthorUrl(),
        editorName: this.getEditorName(),
        editorUrl: this.getEditorUrl(),
        is_pending: this.is_pending,
        is_approved: this.is_approved,
        removed: this.removed
      }
    },
    approveOrDeny (decision) {
      return new Promise((resolve, reject) => {
        if (decision !== "deny" && decision !== "approve") {
          reject("invalid decision must be approve or deny");
        }
        if (this.is_pending) {
          this.is_pending = false;
          this.is_approved = (decision === "approve");
          this.save().exec()
            .then((i) => {
              resolve({
                "is_approved": this.is_approved,
                "reason": "new"
              });
            }).catch((e) => reject(e));
        } else {
          resolve({
            "is_approved": this.is_approved,
            "reason": "not pending"
          })
        }
      })
    },
    edit (data) {
      return new Promise((resolve, reject) => {
        if (data) {
          console.log('data found', data);

          this.editor = data.editor;
          this.updated_at = Date.now();
          this.name = data.name ? Utils.xss(data.name) : this.name;

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
