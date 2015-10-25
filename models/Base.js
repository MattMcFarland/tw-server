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

  addOrRemoveFlag (user, flagType) {
    return new Promise((resolve, reject) => {
      var flagIndex, flag, result;
      try {
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
          .then(() => resolve(result))
          .catch((e) => reject(e));
      } catch (e) { reject(e) }
    });

  }

  createOrUpdateVote (user, direction) {
    return new Promise((resolve, reject) => {
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

        this.save()
          .then((i) => {
          resolve({
            "score": i.score,
            "userVote": newVote
          });
        }).catch((e) => reject(e));
      } catch (e) { reject(e) }
    });
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

  removeOrUndoRemove (editor) {
    return new Promise((resolve, reject) => {
      try {
        this.updated_at = Date.now();
        this.editor = editor;
        this.removed = !this.removed;
        this.save()
          .then((i) => resolve(i))
          .catch((e) => reject(e));
      } catch (e) { reject(e) }
    });
  }

}

module.exports = Base;
