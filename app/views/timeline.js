var backbone = require('backbone-browserify'),
    browserijade = require('browserijade')
    TweetView = require('./tweet');

module.exports =  backbone.View.extend({

  initialize: function() {
    if(this.collection)
      this.bindTo(this.collection);
  },
  
  className : '',

  id : 'timeline',
  tagName : 'div',

  render: function() {
    var that = this;
    this.$el.empty();

    this.$el.html(browserijade('timeline'), {});

    this.$tweets = this.$('>.tweets');
    this.$bottom = this.$('>.bottom');

    return this;
  },

  renderTweets: function() {
    this.$tweets.empty();
    if(this.collection) {
      this.collection.forEach(function(tweet) {
        var view = new TweetView({model : tweet});
        that.$tweets.prepend(view.render().$el);
      });
    }
    this.upBottom();

    return this;
  },

  add: function(tweet, collection, options) {
    var view = new TweetView({model : tweet}).render();
    
    if(options.index === 0)
      this.$tweets.append(view.$el);
    else
      this.$tweets.find('>'+view.tagName+':nth-last-child('+options.index+')').before(view.$el);

    this.upBottom();
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

  upBottom: function() {
    this.$bottom.html('Total: '+this.collection.length+' tweets.');
  },

  refresh: function() {
    this.collection.fetch();
  }
});