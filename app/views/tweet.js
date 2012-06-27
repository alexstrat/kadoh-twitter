var backbone = require('backbone-browserify'),
    browserijade = require("browserijade");

var escapeHTML = function(toescape) {
  return toescape.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;');
};

module.exports = backbone.View.extend({

  attributes: function() {
    return { id : this.model.attributes.id};
  },

  tagName : 'div',
  className : 'tweet',

  render: function() {
    var text = escapeHTML(this.model.get('text'));
    text = text.replace(/#(\w+)/g, function(s, hashtag) {
      return browserijade('link-hashtag', {hashtag : hashtag});
    });
    text = text.replace(/@(\w+)/g, function(s, user) {
      return browserijade('link-mention', {user : user});
    });
    var data = {text   : text,
                date   : this.model.get('date'),
                author : this.model.get('author')}

    var html = browserijade('tweet', data);
    this.$el.html(html);
    return this;
  }
});