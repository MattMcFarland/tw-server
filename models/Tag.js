"use strict";

const
  Document = require('camo').Document,
  Utils    = require('../utils');

class Tag extends Document {
  constructor() {
    super('tags');
    this.schema({
      times_used: { type: Number} ,
      name: {type: String },
      last_used_date: String,
      created_at: { type: String, default: Date.now },
      updated_at: { type: String, default: Date.now },
      author: {type: Object },
      editor: {type: Object },
      is_pending: { type: Boolean, default: true },
      is_approved: { type: Boolean, default: false },
      removed: { type: Boolean, default: false }
    });
  }

  approve (editor, callback) {
    try {
      this.updated_at = new Date().toISOString();
      this.editor = editor;
      this.is_pending = false;
      this.is_approved = true;
      this.save();
      callback (null, this);
    } catch (e) {
      callback (e, null);
    }
  }

  deny (editor, callback) {
    try {
      this.updated_at = new Date().toISOString();
      this.editor = editor;
      this.is_pending = false;
      this.is_approved = false;
      this.save();
      callback (null, this);
    } catch (e) {
      callback (e, null);
    }
  }

  removeOrUndoRemove (editor, callback) {
    try {
      this.updated_at = new Date().toISOString();
      this.editor = editor;
      this.removed = !this.removed;
      this.save((i) => callback(null, i));
    } catch (e) {
      Utils.Log.error(e);
      callback(e);
    }
  }

}

module.exports = Tag;
