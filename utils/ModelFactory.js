"use strict";
const
  _             = require('lodash'),
  Utils         = require('./index'),
  mongoose      = require('mongoose'),
  paginate      = require('mongoose-paginate'),
  Schema        = mongoose.Schema;

var mergeArrays = function (dest, source) {
  var obj = {};
  dest.forEach(function (item) {
    obj[item.key] = item.value;
  });

  source.forEach(function (item) {
    obj[item.key] = item.value;
  });

  return Object.keys(obj).map(function(key){
    return { key, value:obj[key] };
  });
};




class ModelFactory {

  static createProps (options) {
    return Object.assign(options, {

      author: {type: Object},
      editor: {type: Object},

      /* Flagging */
      flaggers: { type: Array, default: []},

      /* Voting */
      voters: { type: Array, default: []},
      score: {type: Number, default: 0},

      /* Meta */
      created_at: {type: Date, default: Date.now},
      updated_at: {type: Date, default: Date.now},
      removed: {type: Boolean, default: false},
      comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]

    })
  }

  static createGetters () {
    return {
      getFlags () {
        return {
          spam: this.countFlags('spam'),
          offensive: this.countFlags('offensive'),
          vague: this.countFlags('vague'),
          duplicate: this.countFlags('duplicate')
        }
      },
      getAuthorName () {
        if (!this.author) {
          return '';
        }
        return this.author.fullName;
      },

      getEditorName () {
        if (!this.editor) {
          return '';
        }
        return this.editor.fullName;
      },

      getAuthorUrl () {
        if (!this.author) {
          return '';
        }
        return 'users/' + Utils.Users.getId(this.author);
      },

      getEditorUrl () {
        if (!this.editor) {
          return '';
        }
        return 'users/' + Utils.Users.getId(this.author);
      },

      getUserVote (user) {
        var uid = Utils.Users.getId(user),
          voteIndex = _.findIndex(this.voters, {'uid': uid});

        return (voteIndex > -1) ? this.voters[voteIndex].vote : 0;
      },

      getUserFlags (user) {
        var uid = Utils.Users.getId(user),
          userFlags = _.filter(this.flaggers, { uid });

        return mergeArrays([
            { "key": "spam", "value": false },
            { "key": "offensive", "value": false },
            { "key": "duplicate", "value": false },
            { "key": "vague", "value": false }
          ],
          userFlags.map(function (flag) {
            return {
              key: flag.type,
              value: true
            };
          })
        );
      },

      getUserPrivs (user) {
        var uid = Utils.Users.getId(user),
          isOwner = this.checkOwnership(uid),
          usergroup, accessLevel, access;

        if (user) {
          if (user.groups && typeof user.groups.items &&
            user.groups.items[0] &&
            user.groups.items[0].name) {
            usergroup = user.groups.items[0].name;
            accessLevel = usergroup === "user" ? 1 : usergroup === "moderator" ? 2 : usergroup === "admin" ? 3 : 0;
          }
          access = (accessLevel >= 2);
        }

        return {
          isModerator: access,
          userCanEdit: access ? true : isOwner,
          userCanDelete: access ? true : isOwner,
          userCanSeeDeleted: access ? true : isOwner
        }
      }
    }
  }

  static createMethods () {
    return {
      countFlags (flagType) {
        return _.countBy(this.flaggers, {type: flagType}).true || 0;
      },
      checkOwnership (uid) {
        //console.log('owner???', uid === Utils.Users.getId(this.author));
        return uid === Utils.Users.getId(this.author);
      },
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
            this.save((err, nd) => {
              if (err) {
                Utils.Log.error(err);
                reject(err)
              } else if (nd) {
                resolve(result);
              } else {
                reject('404');
              }
            })
          } catch (e) { reject(e) }
        });
      },
      createOrUpdateVote (user, direction) {

        return new Promise((resolve, reject) => {
          var voteIndex, newVote, oldVote, uid = Utils.Users.getId(user);
          this.voters && this.voters.length || (this.voters = []);
          voteIndex = _.findIndex(this.voters, {'uid': uid});
          ////console.log('voteIndex', voteIndex);
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
          ////console.log('newVote', uid, newVote);
          this.voters.push({
            uid: uid,
            vote: newVote
          });
          ////console.log('saving...');
          this.score = this.tallyVotes();
          ////console.log('votes tally complete');
          this.save((err, nd) => {
            if (err) {
              Utils.Log.error(err);
              reject(err)
            } else if (nd) {
              resolve({
                "score": nd.score,
                "userVote": newVote
              });
            } else {
              reject('404');
            }
          })
        });
      },

      tallyVotes () {
        var score = 0;
        if (this.voters && this.voters.length) {
          this.voters.forEach((voter) => {
            score += voter.vote;
          });
        }
        return score;
      },

      removeOrUndoRemove (editor) {
        return new Promise((resolve, reject) => {
          this.removed = !this.removed;
          this.save((err, nd) => {
            if (err) {
              Utils.Log.error(err);
              reject(err)
            } else if (nd) {
              resolve(nd);
            } else {
              reject('404');
            }
          })
        });
      }
    }
  }

  /**
   * Creates Model that uses all base methods/schema
   * @param options.name
   * @param options.type
   * @param options.props
   * @param options.methods
   * @returns {Aggregate|*|Model}
   */
  static fabricate (options) {
    options || (options = { props: {}, methods: {} });
    var rawSchema = ModelFactory.createProps(options.props);
    var schema = new mongoose.Schema(rawSchema);
    //schema.plugin(deepPopulate);
    schema.methods = Object.assign(
      options.methods,
      ModelFactory.createGetters(options.type),
      ModelFactory.createMethods());
    schema.plugin(paginate);
    return {model: mongoose.model(options.name, schema), schema: schema};
  }
}


module.exports = ModelFactory;
