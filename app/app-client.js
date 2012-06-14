var browserijade = require("browserijade");
window.$ = require('jquery-browserify');
window.KadOH = require('kadoh');

window.Tweet = require('./models/tweet');
window.TweetCollection = require('./models/tweet-collection');
console.log('bar');

$(function() {
  $('#tweets').append(browserijade('tweet',{
    id : 'tweet-1',
    author : 'alex',
    text : 'j apporte mon grand soutien a Jinroh #foo #bar',
    date : 'March 1st 2012',
    hashtags : ['foo', 'bar']} ));
});
