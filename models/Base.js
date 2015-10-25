"use strict";
// Base Model
const
  _        = require('lodash'),
  Document = require('camo').Document,
  Utils    = require('../utils');

class Base extends Document {
  constructor(name) {
    super(name);

    this.schema({
      author:   { type: Object },
      editor:   { type: Object },
      title:    { type: String },
      content:  { type: String },

      /* Flagging */
      flaggers:         { type: [Object]},

      /* Voting */
      voters: { type: [Object] },

      /* Meta */
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
      removed:    { type: Boolean, default: false}
    });

  }

  static errorOut (e, cb) {
    Utils.Log(e);
    cb(e);
  }

  get DTO () {

    return Object.assign(this, {
      authorName: this.authorName,
      authorUrl: this.authorUrl,
      editorName: this.editorName,
      editorUrl: this.editorUrl,
      id: this.id,
      flags: this.flags,
      score: this.tallyVotes()
    })
  }

  get flags () {
    return {
      spam: this.countFlags('spam'),
      offensive: this.countFlags('offensive'),
      vague: this.countFlags('vague'),
      duplicate: this.countFlags('duplicate')
    }
  }
  get authorName () {
    if (!this.author) {
      return '';
    }
    return this.author.fullName;
  }

  get editorName () {
    if (!this.editor) {
      return '';
    }
    return this.editor.fullName;
  }

  get authorUrl () {
    if (!this.author) {
      return '';
    }
    return 'users/' + Utils.Users.getId(this.author);
  }

  get editorUrl () {
    if (!this.editor) {
      return '';
    }
    return 'users/' + Utils.Users.getId(this.author);
  }

  countFlags (flagType) {
    return _.countBy(this.flaggers, {type: flagType}).true || 0;
  }

  addOrRemoveFlag (user, flagType, callback) {
    var flagIndex, flag, result;

    try {
      console.log('flagging', user, flagType);
      this.flaggers || (this.flaggers = []);

      flagIndex = _.findIndex(this.flaggers, {'uid': Utils.Users.getId(user), type: flagType});
      flag = flagIndex > -1 ? this.flaggers[flagIndex] : undefined;
      result = {
        flagType: flagType,
        isFlagged: null
      };

      if (flag) {
        this.flaggers.splice(flagIndex, 1);
        result.isFlagged = false;
      } else if (typeof flag === "undefined") {
        this.flaggers.push({
          uid: Utils.Users.getId(user),
          type: flagType
        });
        result.isFlagged = true;
      }

      // signal back the new flag
      user.save();
      this.save()
        .then(() => callback(null, result))
        .catch((e) => {
          Utils.Log.error(e);
          callback(e);
        });
      console.log('result', result);
    } catch (e) {
      Utils.Log.error(e);
      callback(e);
    }

  }

  createOrUpdateVote (user, direction, callback) {
    var voteIndex, newVote, oldVote;

    try {
      this.voters || (this.voters = []);
      voteIndex = _.findIndex(this.voters, {'uid': Utils.Users.getId(user)});

      if (voteIndex === -1) {
        newVote = direction === "up" ? 1 : -1;
      } else {
        oldVote = this.voters[voteIndex].vote;
        if (direction === "up") {
          newVote = oldVote === 1 ? 0 : 1;
        } else if (direction === "down") {
          newVote = oldVote === -1 ? 0 : -1;
        }
        this.voters.splice(voteIndex, 1);
      }

      this.voters.push({
        uid: Utils.Users.getId(user),
        vote: newVote
      });

      this.save().then((i) => {
        callback(null, {
          "score": i.score,
          "userVote": newVote
        });
      }).catch((e) => {
        Utils.Log.error(e);
        callback(e);
      });
    } catch(e) {
      Utils.Log.error(e);
      callback(e);
    }
  }

  tallyVotes () {
    var score = 0;
    if (this.voters && this.voters.length) {
      this.voters.forEach((voter) => {
        score += voter.vote;
      });
    }
    return score;
  }

  removeOrUndoRemove (editor, callback) {
    try {
      this.updated_at = Date.now();
      this.editor = editor;
      this.removed = !this.removed;
      this.save()
        .then((i) => callback(null, i))
        .catch((e) => {
          Utils.Log.error(e);
          callback(e);
        });
    } catch (e) {
      Utils.Log.error(e);
      callback(e);
    }
  }

}

module.exports = Base;
