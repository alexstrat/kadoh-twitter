var backbone = require('backbone-browserify');
var browserijade = require("browserijade");

module.exports = backbone.View.extend({

  events: {
    "click .js-refresh" : "onRefresh",
    "submit form" : "onGo",
    "click .go" : "onGo"
  },

  render: function() {
    var html = browserijade('side', {});
    this.$el.html(html);
    return this;
  },

  onRefresh: function(e) {
    e.preventDefault();
    this.trigger('refresh');
  },

  onGo: function(e) {
    e.preventDefault();
    var what = this.$('input').val();

    if(what.charAt(0) === '#') {
      this.trigger('gotohash', what.slice(1))
    }
    if(what.charAt(0) === '@') {
      this.trigger('gotouser', what.slice(1))
    }
  }
  
});