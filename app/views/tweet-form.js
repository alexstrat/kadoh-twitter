var backbone = require('backbone-browserify');
var Tweet = require('../models/tweet');
var browserijade = require("browserijade");

module.exports = backbone.View.extend({

  events: {
    "submit form": "onSubmit",
    "click .js-tweet" : "onSubmit"
  },

  render: function() {
    var html = browserijade('tweet-form', {});
    this.$el.html(html);
    this.delegateEvents();
    return this;
  },

  onSubmit: function(e) {
    e.preventDefault();
    var text = this.$('form>textarea').val();

    if(text.match(/^\s*$/g))
      return;

    this.trigger('submit', text);
  },

  freeze: function() {
    this.$('form>textarea').attr("disabled", "disabled");
    this.$('form .js-tweet').addClass('disabled');
    this.undelegateEvents();
    return this;
  },

  unfreeze: function() {
    this.$('form>textarea').removeAttr('disabled');
    this.$('form .js-tweet').removeClass('disabled');
    this.delegateEvents();
    return this;
  },

  infoWrong: function(text) {
    this.$('.info').text(text || 'Something went wrong..');
  }
});