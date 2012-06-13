var kadoh = require('kadoh');
var StateEventEmitter  = kadoh.util.StateEventEmitter,
    Deferred           = kadoh.util.Deferred,
    Crypto             = kadoh.util.crypto,
    PeerArray          = kadoh.util.PeerArray,
    XORSortedPeerArray = kadoh.util.XORSortedPeerArray,
    IterativeDeferred  = kadoh.util.IterativeDeferred,
 
    globals            = kadoh.globals,

    RoutingTable       = kadoh.dht.RoutingTable,
    Peer               = kadoh.dht.Peer,
    BootstrapPeer      = kadoh.dht.BootstrapPeer,

    Reactor            = kadoh.network.Reactor,
    Ping               = kadoh.network.Ping,
    FindNode           = kadoh.network.FindNode,
    FindValue          = kadoh.network.FindValue,
    Append             = require('./rpc/append'),

    ValueManagement    = kadoh.data.ValueStore;

var Node = module.exports = Peer.extend({
  initialize: function(id, options) {
    this.supr('non-defined', id || Crypto.digest.randomSHA1());

    for (var fn in StateEventEmitter.prototype) {
      if (fn !== 'initialize') this[fn] = StateEventEmitter.prototype[fn];
    }
    StateEventEmitter.prototype.initialize.call(this);

    this.setState('initializing');

    var config = this.config = {};
    for (var option in options) {
      config[option] = options[option];
    }

    if (!Array.isArray(config.bootstraps) || config.bootstraps.length === 0) {
      throw new Error('no bootstrap to join the network');
    } else {
      this._bootstraps = config.bootstraps.map(function(address) {
        return new BootstrapPeer(address);
      });
    }

    this._routingTable = new RoutingTable(this, config.routing_table);
    this._routingTable.on(this.routingTableEvents, this);

    this._reactor = new Reactor(this, config.reactor);
    this._reactor.register({
      PING       : Ping,
      FIND_NODE  : FindNode,
      FIND_VALUE : FindValue,
      APPEND     : Append
    });
    this._reactor.on(this.reactorEvents, this);

    this.setState('initialized');
  },
  
  connect: function(callback, context) {
    if (this.stateIsNot('connected')) {
      if (callback) {
        this.once('connected', callback, context || this);
      }
      this._reactor.connectTransport();
    }
    return this;
  },

  disconnect: function(callback, context) {
    if (this.stateIsNot('disconnected')) {
      if (callback) {
        this.once('disconnected', callback, context || this);
      }
      this._routingTable.stop();
      this._reactor.disconnectTransport();
    }
    return this;
  },

  join: function(callback, context) {
    // lookup process
    var startLookup = function() {
      this.emit('joining');
      return this.iterativeFindNode(this);
    };
    var noBootstrap = function() {
      return new Error('no bootstrap');
    };

    // joining result
    var success = function() {
      this.emit('joined');
    };
    var failure = function() {
      this.emit('join failed');
    };

    //ping the bootstraps
    var pings = this._bootstraps.map(function(peer) {
      return new Ping(peer);
    });
    this._reactor.sendRPC(pings);

    context = context || this;
    Deferred.whenAtLeast(pings)
            .pipe(startLookup, noBootstrap, this)
            .then(success, failure, this)
            .then(callback, callback, context);
    
    return this;
  },

  get: function(key, callback, context) {
    context = context || this;
    this.iterativeFindValue(key).then(
      function(kv) {
        callback.call(context, kv.value);
      }, function() {
        callback.call(context, null);
      });
    return this;
  },

  put: function(key, value, exp, callback, context) {
    // if no exp, arguments sliding
    if (typeof exp == 'function') {
      exp = undefined;
      callback = exp;
      context = callback;
    }

    // default values
    key = key || Crypto.digest.SHA1(String(value));
    exp = exp || -1;
    context = context || this;

    this.iterativeAppend(key, value, exp)
        .then(function(key, peers) {
          if (callback) callback.call(context, key, peers.size());
        }, function() {
          if (callback) callback.call(context, null, 0);
        });
    return this;
  },
  
  reactorEvents : {

    connected: function(address) {
      this.setAddress(address);
      if (typeof this._store == 'undefined') {
        var store_name = ['KadOH', this.getID(), this.getAddress()].join('|');
        this._store = new ValueManagement(store_name, this.config.value_management);
        this._store.on(this.VMEvents, this);
      }
      this.setState('connected');
    },

    disconnected: function() {
      this.setState('disconnected');
    },

    reached: function(peer) {
      peer.touch();
      this._routingTable.addPeer(peer);
    },

    queried: function(rpc) {
      if (!rpc.inProgress())
        return;
      this['handle' + rpc.getMethod()].call(this, rpc);
    },

    outdated: function(peer, id) {
      this._routingTable.removePeer(peer);
      peer.setID(id);
      this._routingTable.addPeer(peer);
    }
  },

  handlePING: function(rpc) {
    rpc.resolve();
  },

  handleFIND_NODE: function(rpc) {
    rpc.resolve(this._routingTable.getClosePeers(rpc.getTarget(), globals.BETA, rpc.getQuerying()));
  },

  handleFIND_VALUE: function(rpc) {
    var nodes = this._routingTable.getClosePeers(rpc.getTarget(), globals.BETA, rpc.getQuerying());
    this._store.retrieve(rpc.getTarget())
        .then(function(value, exp) {
          rpc.resolve(nodes, {value : value, exp : exp});
        }, function() {
          rpc.resolve(nodes, null);
        });
  },

  handleAPPEND: function(rpc) {
    var key = Crypto.digest.SHA1(rpc.getResource());
    var store = this.store;
    store.retrieve(key)
        .pipe(function(value) {
          if(!Array.isArray(value))
            return new Error('not an array');
          value.push(rpc.getData());
          return value;
        }, function() {
          return [rpc.getData()];
        })
        .pipe(function(value) {
          return store.save(key, value, -1);
        })
        .then(rpc.resolve, rpc.reject, rpc);
  },

  routingTableEvents : {
    refresh: function(kbucket) {
      var random_sha = Crypto.digest.randomSHA1(this.getID(), kbucket.getRange());
      this.iterativeFindNode(random_sha);
    }
  },

  VMEvents : {
    republish: function(key, value, exp) {
      this.iterativeAppend(key, value, exp);
    }
  },

  iterativeFindNode: function(target) {
    target = (target instanceof Peer) ? target.getID() : target;

    var send   = this.send(),
        close  = this._routingTable.getClosePeers(target, globals.K),
        init   = new XORSortedPeerArray(close, target),
        lookup = new IterativeDeferred(init),
        staled = false;

    function map(peer) {
      var rpc = new FindNode(peer, target);
      send(rpc);
      return rpc;
    }

    function reduce(peers, newPeers, map) {
      peers.add(newPeers);
      if (peers.newClosestIndex() >= 0 && peers.newClosestIndex() < globals.ALPHA) {
        peers.first(globals.ALPHA, map);
      }
      return peers;
    }

    function end(peers, map, reached) {
      if (staled) {
        lookup.reject(new XORSortedPeerArray(reached, target));
        return;
      }

      if (reached.length <= globals.ALPHA && peers.size() > 0) {
        staled = true;
        peers.first(globals.K, map);
      } else {
        lookup.resolve(new XORSortedPeerArray(reached, target));
      }
    }

    // -- UI HACK
    lookup._target = target;
    this.emit('iterativeFindNode', lookup, close);

    return lookup
      .map(map)
      .reduce(reduce, init)
      .end(end);
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
      .reduce(reduce, init);
  },

  iterativeAppend: function(key, value, exp) {
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

    var stores = function(peers) {
      var targets = peers.first(globals.K);
      var rpcs = targets.map(function(peer) {
        return send(new Append(peer, key, value, exp));
      });
      Deferred.whenAtLeast(rpcs, 1)
              .then(function(stored, notStored) {
                def.resolve(key, querieds(stored), querieds(notStored));
              }, function(stored, notStored) {
                def.reject(querieds(notStored));
              });
    };

    this.iterativeFindNode(key)
        .then(stores, function() { def.reject(new PeerArray()); });

    return def;
  },

  send: function() {
    var reactor = this._reactor;
    return function() {
      return reactor.sendRPC.apply(reactor, arguments);
    };
  }

});
