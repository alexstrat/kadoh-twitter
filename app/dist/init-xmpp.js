var config = {
  bootstraps : [
    'bootstrap0@kadoh.fr.nf/kadoh',
    'bootstrap1@kadoh.fr.nf/kadoh',
    'bootstrap2@kadoh.fr.nf/kadoh'
  ],
  reactor : {
    type: 'xmpp',
    protocol: 'xmlrpc',
    transport : {
      jid : 'kadoh.fr.nf',
      password : null,
      resource : 'kadoh'
    }
  }
};

function createNode() {
  var node = new KadOH.logic.TwitterNode(null, config);
  // KadOH.log.subscribeTo(node, 'Node', 'info');
  // KadOH.log.subscribeTo(node._reactor, 'Reactor', 'debug');
  // KadOH.log.subscribeTo(node._reactor._transport, 'Transport', 'debug');
  // KadOH.log.subscribeTo(node._routingTable, 'RoutingTable', 'debug');
  return node;
}

window.createNode = createNode;
