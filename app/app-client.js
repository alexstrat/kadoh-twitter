var $ = require('jquery-browserify');
require('backbone-browserify').setDomLibrary($);

window.KadOH = require('kadoh');
window.KadOH.logic.TwitterNode = require('../lib/twitter-node')

var Router = require('./controler/router');

$(function() {

  var r = new Router();
  require('backbone-browserify').history.start({pushState: true});
});
