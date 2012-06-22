var Backbone = require('backbone-browserify');
var $ = require('jquery-browserify');
var Connection = require('../views/connection');
var TweetForm = require('../views/tweet-form');
var Tweet = require('../models/tweet');
var Timeline = require('../views/timeline');
var Side = require('../views/side');
var Connection = require('../views/connection');
var Collection = require('../models/tweet-collection');
var kadoh = require('kadoh');
var Reporter = require('../../lib/cube/reporter');
var browserijade = require('browserijade');

module.exports = Backbone.Router.extend({

  initialize: function() {
    var that = this;

    this.$el = $('#container');
    this.$el.html(browserijade('main-connection', {}));
    //init a connection view
    this.connectionView = new Connection({
      el : this.$el.find('#connection-form')
    })
    .render();

    this.connectionView.on('connection', this.onConnect, this);

    //routing
    $('body').on('click', 'a[rel=external]', function(e) {
      that.navigate($(this).attr("href"), {trigger : true});
      e.preventDefault();
    });
  },

  initializeApp: function() {
    this.$el.empty();
    this.$el.html(browserijade('main', {}));

    //init a tweet-form view
    this.tweetForm = new TweetForm({
      el : this.$el.find('#tweet-form')
    })
    .render();
    this.tweetForm.on('submit', this.onTweetSubmit, this);

    //init a timeline view
    this.timeline = new Timeline({
      el : this.$el.find('#timeline')
    })
    .render();

    //init a timeline view
    this.sideView = new Side({
      el : this.$el.find('#side')
    })
    .render()
    .on('refresh', this.refreshTimeline, this)
    .on('gotouser', function(user) {
      this.navigate('/author/'+user, { trigger : true});
      }, this)
    .on('gotohash', function(tag) {
      this.navigate('/hashtag/'+tag, { trigger : true});
      }, this);
  },

  routes: {
    'author/:user' : 'navigateToUser',
    'time/:time' : 'navigateToTime',
    'hashtag/:hashtag' : 'navigateToHashTag'
  },

  onConnect: function(infos) {
    var that = this;
    this.user = infos[0];
    this.twitterNode = window.createNode();
    if(window._kadoh_reporter) {
      this.reporter = new Reporter(this.twitterNode, infos[1]);
      this.reporter.start();
    }

    if(window._kadoh_logger) {
      var Log = new kadoh.logger.reporter.Console(kadoh.logger.logging, 'debug');
      kadoh.logger.logging.subscribeTo(this.twitterNode, 'Node');
      kadoh.logger.logging.subscribeTo(this.twitterNode._reactor, 'Reactor');
      kadoh.logger.logging.subscribeTo(this.twitterNode._reactor._transport, 'Transport');
      kadoh.logger.logging.subscribeTo(this.twitterNode._routingTable, 'RoutingTable');
    }
    that.connectionView.freeze();

    this.connectionView.addStateInfo('connecting...');
    this.twitterNode.connect(function() {
      that.connectionView.addStateInfo('connected.');
      that.connectionView.addStateInfo('joining...');
      
      that.twitterNode.join(function() {
        that.connectionView.addStateInfo('joined.');
        that.initializeApp();
        that.navigate(that._cache_frag && that._cache_frag !== '' ? that._cache_frag :'time/latest', {trigger : true});
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
    this.sideView.spin();
    tweet.save(null, {success : function() {
      that.tweetForm.render();
      that.sideView.spinStop();
      that.refreshTimeline();
    },
    error: function() {
      that.sideView.spinStop();
      that.tweetForm.unfreeze()
                    .infoWrong();
    }});
  },

  refreshTimeline: function() {
    var s = this.sideView;
    this.sideView.spin();
    this.timeline.refresh({
      success : function() {
        s.spinStop();
      },
      error: function() {
         s.spinStop();
      }
    });
  },

  getTweetCollection: function(url) {
    var tweets = new Collection(null, {
      url:url,
      twitterNode: this.twitterNode
    });
    this.sideView.spin();
    var s = this.sideView;
    var stop = function() {
      s.spinStop();
    };
    tweets.fetch({success : stop, error : stop});
    return tweets;
  },

  loadInTimeline: function(collection) {
    this.timeline.unbind()
                 .bindTo(collection)
                 .renderTweets();
    return this;
  },

  navigateToUser :function(user) {
    if(!this.twitterNode) {
       this._cache_frag = Backbone.history.getFragment();
      return this.navigate('/');
    }
    this.loadInTimeline(this.getTweetCollection('/author/'+user));
    return this;
  },

  navigateToTime: function(time) {
    if(!this.twitterNode) {
      this._cache_frag = Backbone.history.getFragment();
      return this.navigate('/');
    }

    this.loadInTimeline(this.getTweetCollection('/time/'+time));
    return this;
  },

  navigateToHashTag: function(hash) {
    if(!this.twitterNode){
       this._cache_frag = Backbone.history.getFragment();
      return this.navigate('/');
    }
    this.loadInTimeline(this.getTweetCollection('/hashtag/'+hash));
    return this;
  }
});