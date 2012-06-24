var HEARTBEAT_INTERVAL = 55 * 1000;

var emitter  = require('./emitter-http')('http:', 'twitter.kadoh.fr.nf', 80);
var distance = require('kadoh').util.crypto.distance;

var mobile = false, bot = false;

var events = {
  node : {
    iterativeFindNode: function(lookup) {
      var begin = new Date().getTime();
      lookup.always(function(reached) {
        lookupHandler(lookup, 'node', begin, reached);
      });
    },

    iterativeFindValue: function(lookup) {
      var begin = new Date().getTime();
      lookup.then(function(result, reached) {
        lookupHandler(lookup, 'value', begin, reached);
      }, function(reached) {
        lookupHandler(lookup, 'value', begin, reached);
      });
    }
  },
  reactor : {
    querying : function(rpc) {
      rpc.always(function() {
        var data = rpc.normalizeParams();
        data.queried  = rpc.getQueried().getID();
        data.querying = rpc.getQuerying().getID();
        data.rtt      = rpc.getRTT();
        data.rejected = rpc.isRejected();
        data.timeout  = rpc.isTimeout();
        switch (rpc.getMethod()) {
          case 'FIND_NODE': case 'FIND_VALUE':
            data.distance = distance(data.queried, rpc.getTarget()); break;
          case 'APPEND':
            data.distance = distance(data.queried, rpc.getResource()); break;
        }
        emit(rpc.getMethod().toLowerCase(), data);
      });
    }
  }
};

function lookupHandler(lookup, type, begin, reached) {
  data = {
    type : type,
    time : new Date().getTime() - begin,
    reached  : reached.size(),
    queries  : lookup._mapped.length,
    closest  : reached.size() > 0 ? reached.getPeer(0).getDistanceTo(lookup._target) : -1,
    rejected : lookup.isRejected()
  };
  emit('iterative_find', data);
}

function emit(type, data) {
  data = data || {};
  data.mobile = mobile;
  data.bot = bot;
  emitter.send({
    type : type,
    time : new Date().toISOString(),
    data : data
  });
}

function heartbeat() {
  emit('heartbeat', {id : self.node.getID()});
}

var Reporter = module.exports = function(node, _mobile, _bot) {
  mobile = _mobile === true ? true : false;
  bot = _bot === true ? true : false;
  this.node = node;
  this.ees  = {
    node : node,
    reactor : node._reactor
  };
};

Reporter.prototype.start = function() {
  for (var name in this.ees) {
    if (events.hasOwnProperty(name)) {
      this.ees[name].on(events[name]);
    }
  }
  heartbeat();
  var self = this;
  this.heart = setInterval(heartbeat, HEARTBEAT_INTERVAL);
};

Reporter.prototype.stop = function() {
  clearInterval(this.heart);
  emitter.close();
};