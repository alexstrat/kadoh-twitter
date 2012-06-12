//new Tweet({
//  author :'alex',
//  text : 'tweet',
//  date : new Date()
//});
var Tweet = Backbone.Model.extend({

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

    return TwitterNode
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

var TweetCollection = Backbone.Collection.extend({
  initialize: function(url) {
    if(typeof url === 'string') this.url = url;
    else if(url.author  !== undefined) this.url = '/author/'+url.author;
    else if(url.hashtag !== undefined) this.url = '/hashtag/'+url.hashtag;
    else if(url.date    !== undefined) this.url = '/time/'+url.date;
  },

  model: Tweet,

  sync: function(method, collection, options) {
    if(method !== 'read')
      options.error(new Error('impossible'));

    return TwitterNode
           .get(collection.url)
           .addProgress(function(tweets) {
             collection.add(tweets);
           })
           .then(options.success, options.error);
  }
});