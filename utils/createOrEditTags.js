var Utils = require('./index');
var Tag = require('../models/Tag');

module.exports = function (tagString, user) {
  var done = false, tags = [], tagArray = tagString.split(',');

  console.log('createOrEditTags', tagArray);

  return new Promise((resolve, reject) => {
    Utils.async.eachSeries(tagArray, (tagName, next) => {
      Utils.async.setImmediate(() => {

        // DRY method for creating or updating a tag.
        function appendTag(tag) {
          tag.save((err, t) => {
            if (err) {
              Utils.Log.error('Failed at tag.save() from appendTag in createOrEditTags.js\n' + e);
              reject(e);
            } else {
              tags.push(t);
              next();
            }
          })
        }

        // Done flag is set when all tags have been processed, which then closes out the loop.
        if (done) {
          next();
        } else {

          // Find out if tag exists or not
          Tag.findOne({name: tagName}, function (err, tag) {
            console.log('findOne', err, tag);
            if (!err && tag) {

              //
              // Update an existing tag.
              //
              console.log('Update existing tag', tagName);
              (function () {

                tag.author = user ? user : '';
                tag.last_used_date = Date.now();
                tag.times_used = tag.times_used ? tag.times_used + 1 : 1;
                appendTag(tag);

              })();

            } else {

              //
              // Create a new tag.
              //
              console.log('Create new tag', tagName);
              (function () {

                var newTag = new Tag();
                newTag.name = tagName;
                newTag.times_used = 1;
                appendTag(newTag);

              })();

            }
          });
        }
      });
    }, () => {
      done = true;
      resolve(tags);
    });
  });
}
