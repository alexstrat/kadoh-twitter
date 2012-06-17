var RPC = require('kadoh').network.rpc.RPC;

var Append = module.exports = RPC.extend({

  initialize: function(queried_peer, resource, data, exp) {
    if (arguments.length === 0) {
      this.supr();
    } else {
      this.supr(queried_peer, 'APPEND', [resource, data, exp || -1]);
    }
  },

  getResource: function() {
    return this.getParams(0);
  },

  getData: function() {
    return this.getParams(1);
  },

  getExpiration: function() {
    return this.getParams(2);
  },

  normalizeParams: function() {
    var exp = this.getExpiration();
    if (!exp || ~exp) exp = -1;
    return {
      resource : this.getResource(),
      data     : this.getData(),
      exp      : exp
    };
  },

  handleNormalizedParams: function(params) {
    if (typeof params.resource !== 'string' ||
        !globals.REGEX_NODE_ID.test(params.resource) ||
        !Array.isArray(params.data)) {
      return this.reject(new Error('non valid store key'));
    } else {
      this.params = [
        params.resource,
        params.data,
        params.exp
      ];
    }
  },

  normalizeResult: function() {
    return {};
  },

  handleNormalizedResult: function(result) {
    this.resolve();
  }

});