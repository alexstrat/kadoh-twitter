var kadoh = require('kadoh');

var KadNode            = kadoh.logic.KademliaNode,

    crypto             = kadoh.util.crypto,
    Deferred           = kadoh.util.Deferred,
    PeerArray          = kadoh.util.PeerArray,
    XORSortedPeerArray = kadoh.util.XORSortedPeerArray,
    IterativeDeferred  = kadoh.util.IterativeDeferred,

    globals            = kadoh.globals,

    FindValue          = kadoh.network.FindValue,
    Append             = require('./rpc/append');

var TwitterNode = module.exports = KadNode.extend({

  initialize: function(id, options) {
    this.supr(id, options);
    this._reactor.register({
      APPEND : Append
    });
  },

  post: function(model, collections) {
    var self = this;
    var promises = collections.map(function(url) {
        var key = crypto.digest.SHA1(url);
        return self.iterativeAppend(key, [model]);
      });
    return Deferred.whenAll(promises);
  },

  get: function(resource) {
    var key = crypto.digest.SHA1(resource);
    return this.iterativeFindValue(key);
  },

  handleAPPEND: function(rpc) {
    var key = rpc.getResource();
    var store = this.store;
    var changed = true;
    store.retrieve(key)
        .pipe(function(value) {
          if(!Array.isArray(value))
            return new Error('not an array');
          var ids  = value.map(function(v) { return v.id; });
          var data = rpc.getData();
          for (var i = 0, l = data.length; i < l; i++) {
            if (~ids.indexOf(data[i].id))
              value.push(data[i]);
          }
          if (value.length === l) changed = false;
          return value;
        }, function() {
          return rpc.getData();
        })
        .pipe(function(value) {
          if (changed)
            return store.save(key, value, -1);
        })
        .then(rpc.resolve, rpc.reject, rpc);
  },

  VMEvents : {
    republish: function(key, value, exp) {
      if (Array.isArray(value)) {
        this.iterativeAppend(key, value, exp);
      } else {
        this.iterativeStore(key, value, exp);
      }
    }
  },

  iterativeFindValue: function(key) {
    if (!globals.REGEX_NODE_ID.test(key)) {
      throw new TypeError('non valid key');
    }

    var send    = this.send(),
        close   = this._routingTable.getClosePeers(key, globals.K),
        seen    = new XORSortedPeerArray(close, key),
        lookup  = new IterativeDeferred(init),
        init    = {};

    function merge(origin, data) {
      for (var i = 0, l = data.length; i < l; i++) {
        if (!origin.hasOwnProperty(data.id)) {
          origin[data.id] = data;
        }
      }
      return origin;
    }

    function map(peer) {
      var rpc = new FindValue(peer, key);
      send(rpc);
      return rpc;
    }

    function reduce(results, nodes, result, map) {
      seen.add(nodes);
      var newClosest = seen.newClosestIndex();
      if(newClosest >= 0 && newClosest < globals.ALPHA) {
        seen.first(globals.ALPHA, map);
      }
      if (result) {
        merge(results, result);
        lookup.progress(results);
      }
      return results;
    }

    function end(results, map, reached) {
      reached = new XORSortedPeerArray(reached, key);
      var arr = [];
      for (var i in results) {
        if (results.hasOwnProperty(i)) arr.push(results[i]);
      }
      if (arr.length > 0) {
        lookup.resolve(arr, reached);
      } else {
        lookup.reject(reached);
      }
    }

    // -- UI HACK
    lookup._target = key;
    this.emit('iterativeFindValue', lookup, close);

    return lookup
      .map(map)
      .reduce(reduce, init)
      .end(end);
  },

  iterativeAppend: function(key, values, exp) {
    if (!globals.REGEX_NODE_ID.test(key)) {
      throw new TypeError('non valid key');
    }

    function querieds(rpcs) {
      return new PeerArray(rpcs.map(function(rpc) {
        return rpc.getQueried();
      }));
    }

    var def = new Deferred(),
        send = this.send();

    var appends = function(peers) {
      var targets = peers.first(globals.K);
      var rpcs = targets.map(function(peer) {
        return send(new Append(peer, key, values, exp));
      });
      Deferred.whenAtLeast(rpcs, 1)
              .then(function(appended, notAppended) {
                def.resolve(key, querieds(appended), querieds(notAppended));
              }, function(appended, notAppended) {
                def.reject(querieds(notAppended));
              });
    };

    this.iterativeFindNode(key)
        .then(appends, function() { def.reject(new PeerArray()); });

    return def;
  }

});
