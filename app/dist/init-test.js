var Node = function() {
};

Node.prototype = {
  connect: function(cb) {
    setTimeout(cb, 500);
  },
  join: function(cb) {
    setTimeout(cb, 500);
  },
  post: function(tweet, collections) {
    var def = new window.KadOH.util.Deferred();
    console.log('posting', tweet, collections);
    setTimeout(function() {
      def.resolve();
    }, 500);
    return def;
  },
  get: function(resource) {
    var def = new window.KadOH.util.Deferred();
    var tweets = [];

    setTimeout(function() {
      tweets.push({
        id : 'tweet-1',
        author : 'alex',
        text : 'j apporte mon grand soutien a Jinroh #foo #bar',
        date : new Date(1339762350464+30000)});
      def.progress(tweets);
    },1000);

    setTimeout(function() {
      tweets.push({
        id : 'tweet-2',
        author : 'pierre',
        text : 'Merci alex, t es un chef',
        date : new Date(1339762350464+50000)});
      def.progress(tweets);
    },2000);

    setTimeout(function() {
      tweets.push({
        id : 'tweet-3',
        author : 'pierre',
        text : 'Je suis candiadat dans la #PACA',
        date : new Date(1339762350464)});
      def.progress(tweets);
      def.resolve(tweets);
    },2500);

    return def;
  }
};

function createNode() {
  return new Node();
}

window.createNode = createNode;