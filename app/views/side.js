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
    this.spinner = new Spinner({
      color: '#E9E9E9',
      length : 4,
      top : 20,
      left: 20
    }).spin(this.$('.spinner')[0]);
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
      this.trigger('gotohash', what.slice(1));
    }
    if(what.charAt(0) === '@') {
      this.trigger('gotouser', what.slice(1));
    }
  },

  spin: function() {
    this.spinner.spin(this.$('.spinner')[0]);
  },

  spinStop: function() {
    this.spinner.stop();
  }
  
});