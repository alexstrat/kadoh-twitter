node = null;

var config = {
  bootstraps : [
    'bootstrap0@kadoh.fr.nf/kadoh',
    'bootstrap1@kadoh.fr.nf/kadoh',
    'bootstrap2@kadoh.fr.nf/kadoh'
  ],
  reactor : {
    transport : {
      jid      : 'kadoh@jabber.org',
      password : 'azerty',
      resource : 'kadoh'
    }
  }
};

function createNode(jid, password) {
  config.reactor.transport.jid = jid;
  config.reactor.transport.password = password;
  node = new KadOH.Node(undefined, config);

  KadOH.log.subscribeTo(node, 'Node', 'info');
  KadOH.log.subscribeTo(node._reactor, 'Reactor', 'debug');
  KadOH.log.subscribeTo(node._reactor._transport, 'Transport', 'debug');
  KadOH.log.subscribeTo(node._routingTable, 'RoutingTable', 'debug');
}

window.createNode = createNode;
