var backbone = require('backbone-browserify'),
    TweetView = require('./tweet');

module.exports =  backbone.View.extend({

  initialize: function() {
    if(this.collection)
      this.bindTo(this.collection);
  },
  
  className : 'five columns centered',

  id : 'timeline',
  tagName : 'div',

  render: function() {
    var that = this;
    this.$el.empty();

    if(this.collection) {
      this.collection.forEach(function(tweet) {
        var view = new TweetView({model : tweet});
        that.$el.prepend(view.render().$el);
      });
    }

    return this;
  },

  add: function(tweet, collection, options) {
    var view = new TweetView({model : tweet}).render();
    if(options.index === 0)
      this.$el.append(view.$el);
    else
      this.$('>'+view.tagName+':nth-child('+(collection.length-options.index)+')').before(view.$el);
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