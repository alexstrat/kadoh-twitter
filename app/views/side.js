var backbone = require('backbone-browserify');
var browserijade = require("browserijade");

module.exports = backbone.View.extend({

  events: {
    "click .js-refresh" : "onRefresh"
  },

  render: function() {
    var html = browserijade('side', {});
    this.$el.html(html);
    return this;
  },

  onRefresh: function(e) {
    e.preventDefault();
    this.trigger('refresh');
  }
  
});