var Backbone = require('backbone-browserify');
var $ = require('jquery-browserify');
var Connection = require('../views/connection');
var TweetForm = require('../views/tweet-form');
var Tweet = require('../models/tweet');
var Timeline = require('../views/timeline');
var Connection = require('../views/connection');
var Collection = require('../models/tweet-collection');
var kadoh = require('kadoh');

module.exports = Backbone.Router.extend({

  initialize: function() {
    var that = this;
    //init a connection view
    this.connectionView = new Connection();
    $('#main').append(this.connectionView
                         .render()
                         .$el);
    this.connectionView.on('connection', this.onConnect, this);

    //init a tweet-form view
    this.tweetForm = new TweetForm();
    $('#main').append(this.tweetForm
                         .render()
                         .freeze()
                         .$el);
    this.tweetForm.on('submit', this.onTweetSubmit, this);

    //init a timeline view
    this.timeline = new Timeline();
    $('#main').append(this.timeline
                         .render()
                         .$el);

    //routing
    $('body').on('click', 'a[rel=external]', function(e) {
      that.navigate($(this).attr("href"), {trigger : true});
      e.preventDefault();
    });
  },


  routes: {
    'author/:user' : 'navigateToUser',
    'time/:time' : 'navigateToTime',
    'hashtag/:hashtag' : 'navigateToHashTag'
  },

  onConnect: function(cred) {
    var that = this;
    this.user = cred[0];
    this.twitterNode = window.createNode(cred[1], cred[2]);

    var Log = new kadoh.logger.reporter.Console(kadoh.logger.logging, 'debug');
    kadoh.logger.logging.subscribeTo(this.twitterNode, 'Node');
    kadoh.logger.logging.subscribeTo(this.twitterNode._reactor, 'Reactor');
    kadoh.logger.logging.subscribeTo(this.twitterNode._reactor._transport, 'Transport');
    kadoh.logger.logging.subscribeTo(this.twitterNode._routingTable, 'RoutingTable');
    that.connectionView.freeze();

    this.twitterNode.connect(function() {
      that.twitterNode.join(function() {
        var now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        that.tweetForm.unfreeze();
        that.navigate('time/'+now.valueOf(), {trigger : true});
      });
    });
  },

  onTweetSubmit: function(text) {
    var that = this;
    this.tweetForm.freeze();
    var tweet = new Tweet({
      text: text,
      date: new Date().getTime(),
      author: this.user
    });
    tweet.setId();
    tweet.twitterNode = this.twitterNode;
    tweet.save(null, {success : function() {
      that.tweetForm.render();
      that.timeline.refresh();
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
                 .renderTweets();
    return this;
  },

  navigateToUser :function(user) {
    if(!this.twitterNode)
      return this.navigate('/');
    this.loadInTimeline(this.getTweetCollection('/author/'+user));
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