var Backbone = require('backbone-browserify');
var Tweet = require('./tweet');

/**
 * Speicfy a tzwitter node and a url in options for fetching
 * @type {[type]}
 */
module.exports = Backbone.Collection.extend({
  initialize: function(models, options) {
    if(options.url) {
      var url = options.url;
      if(typeof url === 'string') this.url = url;
      else if(url.author  !== undefined) this.url = '/author/'+url.author;
      else if(url.hashtag !== undefined) this.url = '/hashtag/'+url.hashtag;
      else if(url.date    !== undefined) this.url = '/time/'+url.date;
    }
    if(options && options.TwitterNode)
      this.TwitterNode = options.TwitterNode;
  },

  model: Tweet,

  comparator: function(tweet) {
    return tweet.getDate();
  },

  sync: function(method, collection, options) {
    if(method !== 'read')
      options.error(new Error('impossible'));

    return this.TwitterNode
               .get(collection.url)
               .addProgress(function(tweets) {
                 collection.add(tweets);

                 if(options.progress)
                  options.progress(collection, tweets);
               })
               .then(options.success, options.error);
  }
});