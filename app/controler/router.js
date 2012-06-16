var Backbone = require('backbone-browserify');
var $ = require('jquery-browserify');
var Connection = require('../views/connection');
var TweetForm = require('../views/tweet-form');
var Timeline = require('../views/timeline');
var Connection = require('../views/connection');
var Collection = require('../models/tweet-collection');

module.exports = Backbone.Router.extend({

  initialize: function() {
    //init a connection view
    this.connectionView = new Connection();
    $('body').append(this.connectionView
                         .render()
                         .$el);
    this.connectionView.on('connection', this.onConnect, this);

    //init a tweet-form view
    this.tweetForm = new TweetForm();
    $('body').append(this.tweetForm
                         .render()
                         .freeze()
                         .$el);
    this.tweetForm.on('submit', this.onTweetSubmit, this);

    //init a timeline view
    this.timeline = new Timeline();
    $('body').append(this.timeline
                         .render()
                         .$el);
  },


  routes: {
    'user/:user' : 'navigateToUser',
    'time/:time' : 'navigateToTime',
    'hashtag/:hashtag' : 'navigateToHashTag'
  },

  onConnect: function(cred) {
    var that = this;
    this.user = cred[0];
    this.twitterNode = window.createNode(cred[1], cred[2]);
    that.connectionView.freeze();

    this.twitterNode.connect(function() {
      that.twitterNode.join(function() {
        that.tweetForm.unfreeze();
        that.navigate('time/'+Date.now(), {trigger : true});
      });
    });
  },

  onTweetSubmit: function(tweet) {
    var that = this;
    this.tweetForm.freeze();
    tweet.twitterNode = this.twitterNode;
    tweet.set('author', this.user);
    tweet.save(null, {success : function() {
      that.tweetForm.render();
    }});
  },

  getTweetCollection: function(url) {
    var tweets = new Collection(null, {
      url:url,
      twitterNode: this.twitterNode
    });
    tweets.fetch();
    return tweets;
  },

  loadInTimeline: function(collection) {
    this.timeline.unbind()
                 .bindTo(collection)
                 .render();
    return this;
  },

  navigateToUser :function(user) {
    if(!this.twitterNode)
      return this.navigate('/');
    this.loadInTimeline(this.getTweetCollection('/user/'+user));
    return this;
  },

  navigateToTime: function(time) {
    if(!this.twitterNode)
      return this.navigate('/');
    this.loadInTimeline(this.getTweetCollection('/time/'+time));
    return this;
  },

  navigateToHashTag: function(hash) {
    if(!this.twitterNode)
      return this.navigate('/');
    this.loadInTimeline(this.getTweetCollection('/hashtag/'+hash));
    return this;
  }
});