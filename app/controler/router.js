var Backbone = require('backbone-browserify');

module.exports = Backbone.Router.extend({
  routes: {
    'user/:user' : 'navigateToUser',
    'time/:time' : 'navigateToTime',
    'hashtag/:hashtag' : 'navigateToHashTag',
  }

})