var $ = require('jquery-browserify');
require('backbone-browserify').setDomLibrary($);

window.KadOH = require('kadoh');

var Tweet = require('./models/tweet');
var TweetView = require('./views/tweet');
var TweetCollection = require('./models/tweet-collection');
var TimeLine = require('./views/timeline')

console.log('bar');

$(function() {

  var t = new TweetCollection([{
    id : 'tweet-1',
    author : 'alex',
    text : 'j apporte mon grand soutien a Jinroh #foo #bar',
    date : 'March 2st 2012'}]);

  var v = new TimeLine({collection : t});

  v.render();

  $('body').append(v.$el);

  setTimeout(function() {
    t.add({
      id : 'tweet-2',
      author : 'pierre',
      text : 'Merci alex, t es un chef',
      date : 'March 3st 2012'})
  }, 2000)
  setTimeout(function() {
    t.add({
      id : 'tweet-3',
      author : 'pierre',
      text : 'Je suis candiadat dans la #PACA',
      date : 'March 1st 2012'})
  }, 3000)
});
