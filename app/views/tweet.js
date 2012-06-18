var backbone = require('backbone-browserify'),
    browserijade = require("browserijade");

module.exports = backbone.View.extend({

  attributes: function() {
    return { id : this.model.attributes.id};
  },

  tagName : 'div',
  className : 'tweet',

  render: function() {
    var text = this.model.get('text').replace(/#(\w+)/g, function(s, hashtag) {
      return browserijade('link-hashtag', {hashtag : hashtag});
    });
    var data = {text   : text,
                date   : this.model.get('date'),
                author : this.model.get('author')}

    var html = browserijade('tweet', data);
    this.$el.html(html);
    return this;
  }
});