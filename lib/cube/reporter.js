var HEARTBEAT_INTERVAL = 55 * 1000;

var emitter  = require('./emitter-http')('http:', 'collector.kadoh.fr.nf');
var distance = require('kadoh').util.crypto.distance;

var mobile = false;

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
  emitter.send({
    type : type,
    mobile : mobile,
    time : new Date().getTime(),
    data : data || {}
  });
}

var Reporter = module.exports = function(node, mob) {
  mobile = mob === true ? true : false;
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
  var self = this;
  this.heartbeat = setInterval(function() {
    emit('heartbeat', {id : self.node.getID()});
  }, HEARTBEAT_INTERVAL);
};

Reporter.prototype.stop = function() {
  clearInterval(this.heartbeat);
  emitter.close();
};