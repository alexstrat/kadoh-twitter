var backbone = require('backbone-browserify'),
    browserijade = require('browserijade')
    TweetView = require('./tweet');

module.exports =  backbone.View.extend({

  initialize: function() {
    if(this.collection)
      this.bindTo(this.collection);
  },
  
  className : 'row',

  id : 'timeline',
  tagName : 'div',

  render: function() {
    var that = this;
    this.$el.empty();

    this.$el.html(browserijade('timeline'), {});

    this.$tweets = this.$('>#tweets');
    this.$loading = this.$('>#loading');

    return this;
  },

  renderTweets: function() {
    if(this.collection) {
      this.collection.forEach(function(tweet) {
        var view = new TweetView({model : tweet});
        that.$tweets.prepend(view.render().$el);
      });
    }

    return this;
  },

  add: function(tweet, collection, options) {
    var view = new TweetView({model : tweet}).render();
    if(options.index === 0)
      this.$tweets.append(view.$el);
    else
      this.$tweets.find('>'+view.tagName+':nth-child('+(collection.length-options.index)+')').before(view.$el);
    return this;
  },

  bindTo: function(collection) {

    this.collection = collection;
    this.collection.on('add', this.add, this);
    return this;
  },

  //bad overriding
  unbind: function() {
    if(this.collection) {
      this.collection.off('add', this.add);
      delete this.collection;
    }
    return this;
  },

  setLoading: function() {
    //display a spin
  },

  unsetLoading: function() {
    //un-display a spin
  }
});