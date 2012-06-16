var backbone = require('backbone-browserify');
var Tweet = require('../models/tweet');
var browserijade = require("browserijade");

module.exports = backbone.View.extend({

  events: {
    "submit #tweet-form": "onSubmit"
  },

  tagName : 'div',
  className : 'tweet-form',

  render: function() {
    var html = browserijade('tweet-form', {});
    this.$el.html(html);
    return this;
  },

  onSubmit: function(e) {
    e.preventDefault();
    var text = this.$('form>textarea').val();

    if(text.match(/^\s*$/g))
      return;

    var t = new Tweet({text : text, date : new Date()});
    this.trigger('submit', t);
    this.freeze();
  },

  freeze: function() {
    this.$('form>textarea').attr("disabled", "disabled");
    this.$('form>button').attr("disabled", "disabled");
    return this;
  },

  unfreeze: function() {
    this.$('form>textarea').removeAttr("disabled");
    this.$('form>button').removeAttr("disabled");
    return this;
  }
});