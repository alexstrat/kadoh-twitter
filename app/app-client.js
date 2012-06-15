var $ = require('jquery-browserify');
require('backbone-browserify').setDomLibrary($);

window.KadOH = require('kadoh');

var Tweet = require('./models/tweet');
var TweetView = require('./views/tweet');
var TweetCollection = require('./models/tweet-collection');
var TweetForm = require('./views/tweet-form');
var TimeLine = require('./views/timeline')
var Connection = require('./views/connection')


$(function() {

  var t = new TweetCollection([{
    id : 'tweet-1',
    author : 'alex',
    text : 'j apporte mon grand soutien a Jinroh #foo #bar',
    date : new Date(1339762350464+30000)}]);

  var v = new TimeLine({collection : t});
  var f = new TweetForm();
  var c = new Connection();

  c.render();
  f.render();
  v.render();
  f.on('submit', function(tweet) {
    f.freeze();
    setTimeout(function() {
      tweet.set('author', 'alex');
      tweet.set('id', 'tweet-'+tweet.attributes.date.valueOf());
      t.add(tweet);
      f.render();
    },500);
  });
  $('body').append(c.$el)
           .append(f.$el)
           .append(v.$el);

  setTimeout(function() {
    t.add({
      id : 'tweet-2',
      author : 'pierre',
      text : 'Merci alex, t es un chef',
      date : new Date(1339762350464+50000)})
  }, 2000)
  setTimeout(function() {
    t.add({
      id : 'tweet-3',
      author : 'pierre',
      text : 'Je suis candiadat dans la #PACA',
      date : new Date(1339762350464)})
  }, 3000)
});
