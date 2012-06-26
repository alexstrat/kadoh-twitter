var backbone = require('backbone-browserify'),
    browserijade = require("browserijade");

module.exports = backbone.View.extend({

  events: {
    "submit form": "onSubmit",
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
    var username = this.$('form .username').val();
    var mobile = this.$('form .mobile').prop('checked');
    if(username.match(/^\s*$/g))
      return;
    this.trigger('connection', [username, mobile]);
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