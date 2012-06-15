var backbone = require('backbone-browserify'),
    TweetView = require('./tweet');

module.exports =  backbone.View.extend({

  initialize: function() {
    this.collection.on('add', this.add, this);
  },
  
  id : 'timeline',
  tagName : 'div',

  render: function() {
    var that = this;

    this.$el.empty();
    this.collection.forEach(function(tweet) {
      var view = new TweetView({model : tweet});
      that.$el.append(view.render().$el);
    });
    return this;
  },

  add: function(tweet, collection, options) {
    var view = new TweetView({model : tweet}).render();
    if(options.index === 0)
      this.$el.prepend(view.$el);
    else
      this.$('>'+view.tagName+':nth-child('+options.index+')').after(view.$el);
  }
});