var backbone = require('backbone-browserify'),
    browserijade = require("browserijade");

module.exports = backbone.View.extend({

  events: {
    "submit #connection-form": "onSubmit",
    "click .js-submit": "onSubmit"
  },

  tagName : 'div',
  className : 'connection',

  render: function() {
    var html = browserijade('connection-form', {});
    this.$el.html(html);
    this.delegateEvents();
    return this;
  },

  onSubmit: function(e) {
    e.preventDefault();
   
    var id = this.$('form>.id').val();
    var password = this.$('form>.password').val();
    var username = this.$('form>.username').val();

    if(id.match(/^\s*$/g) || password.match(/^\s*$/g) || username.match(/^\s*$/g))
      return;

   
    this.trigger('connection', [username, id, password]);
    this.freeze();
  },

  freeze: function() {
    
    this.$('form>.id').attr("disabled", "disabled");
    this.$('form>.password').attr("disabled", "disabled");
    this.$('form>.username').attr("disabled", "disabled");
    this.$('form>.js-submit').addClass('disabled');
    this.undelegateEvents();
    return this;
  }
});