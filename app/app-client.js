var $ = require('jquery-browserify');
require('backbone-browserify').setDomLibrary($);

window.KadOH = require('kadoh');

var Tweet = require('./models/tweet');
var TweetView = require('./views/tweet');
var TweetCollection = require('./models/tweet-collection');

console.log('bar');

$(function() {

  var t = new Tweet({
    id : 'tweet-1',
    author : 'alex',
    text : 'j apporte mon grand soutien a Jinroh #foo #bar',
    date : 'March 1st 2012'});

  var v = new TweetView({model : t});

  v.render();

  $('#tweets').append(v.$el);
});
