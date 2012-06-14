var backbone = require('backbone-browserify'),
    browserijade = require("browserijade");

module.exports = backbone.View.extend({

  attributes: function() {
    return { id : this.model.attributes.id};
  },

  tagName : 'div',
  className : 'tweet',

  render: function() {
    this.model.setHashTags(); //trigger hashtags extractionm

    var html = browserijade('tweet', this.model.attributes);
    this.$el.html(html);
  }

});