var Backbone = require('backbone-browserify');
var $ = require('jquery-browserify');
var Connection = require('../views/connection');
var Collection = require('../models/tweet-collection');
var TimeLine = require('../views/timeline')

module.exports = Backbone.Router.extend({

  initialize: function() {
    this.connectionView = new connectionView();
    $('body').append(this.connectionView.render().$el);

    this.connectionView.on('connection', this.connect, this);
  },


  routes: {
    'user/:user' : 'navigateToUser',
    'time/:time' : 'navigateToTime',
    'hashtag/:hashtag' : 'navigateToHashTag',
  }

  connect: function(cred) {
    //todo connection
    //set this.twitterNode();
    //this.navigate('time/'+Date.now());
  },

  loadTimelineView: function(url) {
    if(this.timelineView)
      this.timelineView.remove();

    var tweets = new Collection({
      url : url,
      twitterNode : this.twitterNode});
    var timeline = new TimeLine(tweets);
    tweets.fetch();
  }
})