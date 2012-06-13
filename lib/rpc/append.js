var RPC = require('kadoh').network.rpc.RPC;

var Append = module.exports = RPC.extend({

  initialize: function(queried_peer, resource, dataId, data, exp) {
    if (arguments.length === 0) {
      this.supr();
    } else {
      this.supr(queried_peer, 'APPEND', [resource, dataId, data, exp || -1]);
    }
  },

  getResource: function() {
    return this.getParams(0);
  },

  getDataId: function() {
    return this.getParams(1);
  },

  getData: function() {
    return this.getParams(2);
  },

  getExpiration: function() {
    return this.getParams(3);
  },

  normalizeParams: function() {
    var exp = this.getExpiration();
    if (!exp || ~exp) exp = -1;
    return {
      resource : this.getResource(),
      data_id  : this.getDataId(),
      data     : this.getData(),
      exp      : exp
    };
  },

  handleNormalizedParams: function(params) {
    if (typeof params.key !== 'string' || !globals.REGEX_NODE_ID.test(params.key)) {
      return this.reject(new Error('non valid store key'));
    } else {
      this.params = [
        params.resource,
        params.data_id,
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