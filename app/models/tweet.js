var Backbone = require('backbone-browserify');
var twttr = require('twitter-text');

/**
 * attributes : author, text, date
 * sepcify a twitterNode in options for saving
 * @type {[type]}
 */
module.exports = Backbone.Model.extend({

  initialize: function(attr, options) {
    if(!options.TwitterNode)
      this.TwitterNode = options.TwitterNode;
  },

  getAuthor: function() {
    return this.get('author');
  },

  getText: function() {
    return this.get('text');
  },

  getDate: function() {
    return this.get('date');
  },

  getHashTags: function() {
    return twttr.txt.extractHashtags(this.getText());
  },

  urlRoot: '/tweet',

  sync: function(method, tweet, options) {
    if(method !== 'create')
      options.error(new Error('impossible'));

    return this.TwitterNode
               .post(tweet.getText(),
                     tweet.getHashTags(),
                     tweet.getAuthor(), 
                     tweet.getDate())
               .pipe(function() {
                return {
                  id : tweet.getAuthor()+tweet.getDate().valueOf()
                  };
               })
               .then(options.success, options.error);
  }
});