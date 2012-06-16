var $ = require('jquery-browserify');
require('backbone-browserify').setDomLibrary($);

window.KadOH = require('kadoh');

var Router = require('./controler/router');

$(function() {

  var r = new Router();
  require('backbone-browserify').history.start({pushState: true});
});
