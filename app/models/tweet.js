var Backbone = require('backbone-browserify');
var twttr = require('twitter-text');

/**
 * attributes : author, text, date
 * sepcify a twitterNode in options for saving
 * @type {[type]}
 */
module.exports = Backbone.Model.extend({

  initialize: function(attr, options) {
    if(options && options.twitterNode)
      this.twitterNode = options.twitterNode;
  },

  getId: function() {
    this.get('id') || this.setId();
    return this.get('id');
  },

  setId: function() {
    this.set('id', this.getAuthor() + '-' + this.getDate().getTime());
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

  setHashTags: function() {
    var hashtags = twttr.extractHashtags(this.getText());
    this.set('hashtags', hashtags);
  },
  
  getHashTags: function() {
    this.get('hashtags') || this.setHashTags();
    return this.get('hashtags');
  },

  urlRoot: '/tweet',

  sync: function(method, tweet, options) {
    if(method !== 'create')
      options.error(new Error('impossible'));

    //trunk date
    var trunkedDate = new Date(tweet.getDate());
    trunkedDate.setMinutes(0);
    trunkedDate.setSeconds(0)
    trunkedDate.setMilliseconds(0);

    tweet.setId();

    var collections = tweet.getHashTags().map(function(tag) {
        return '/hashtag/' + tag;
      }).concat([
        '/author/' + tweet.getAuthor(),
        '/time/' + trunkedDate.valueOf()
      ]);

    return this.twitterNode
               .post(tweet.attributes, collections)
               .pipe(function() {
                return {
                  id : tweet.getAuthor() + tweet.getDate().valueOf()
                };
               })
               .then(options.success, options.error);
  }
});