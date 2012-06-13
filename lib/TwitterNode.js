var kadoh = require('kadoh');
var StateEventEmitter = kadoh.util.StateEventEmitter;
var SHA1 = kadoh.util.crypto.digest.SHA1;

//globals
var BETA = 8;

StateEventEmitter.extend({
  reactorEvents : {
    reached: function(peer) {
      peer.touch();
      this.routingTable.addPeer(peer);
    },

    queried: function(rcp) {
      switch(rpc.getMethod()) {
        case 'PING':
          rpc.resolve();
          break;
        case 'FIND_NODE':
          rpc.resolve(
            this.routingTable.getClosePeers(
              rpc.getTarget(),
              BETA,
              rpc.getQuerying()),
            false);
          break;
        case 'APPEND':
          var key = SHA1(rpc.getRessource());
          this.store
              .retrieve(key)
              .pipe(function(value) {
                if(!Array.isArray(value))
                  return new Error('not an array');
                value.push(rpc.getData());
                return value;
              }, function() {
                //go for resolve..
                return [rpc.getData()];
              })
              .pipe(function(value) {
                return this.store.save(key, value, -1)
              }, this)
              .then(rpc.resolve, rpc.reject, rpc);
          break;
      }
    }
  }
});