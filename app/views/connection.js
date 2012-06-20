var backbone = require('backbone-browserify'),
    browserijade = require("browserijade");

module.exports = backbone.View.extend({

  events: {
    "submit #form": "onSubmit",
    "click .js-submit": "onSubmit"
  },

  render: function() {
    var html = browserijade('connection-form', {});
    this.$el.html(html);
    this.delegateEvents();
    return this;
  },

  onSubmit: function(e) {
    e.preventDefault();
    var username = this.$('form>.username').val();
    this.trigger('connection', [username]);
    this.freeze();
  },

  freeze: function() {
    this.$('form>.username').attr("disabled", "disabled");
    this.$('form>.js-submit').addClass('disabled');
    this.undelegateEvents();
    return this;
  },

  addStateInfo: function(text) {
    this.$('.state-info').append(text+'<br/>');
  }
});