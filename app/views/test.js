var text = require('fs').readFileSync(__dirname+'/tweet.jade');

fn = require('jade').compile(text);

console.log(fn({
  author : 'alex',
  text : 'fofofoofo',
  date : 'tody',
  hashtags : ['foo', 'bar']}));