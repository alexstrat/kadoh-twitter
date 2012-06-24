function createNode() {
  var config = {
    bootstraps : [
      'bootstrap5@kadoh.fr.nf/kadoh',
      'bootstrap6@kadoh.fr.nf/kadoh',
      'bootstrap7@kadoh.fr.nf/kadoh',
      'bootstrap8@kadoh.fr.nf/kadoh'
    ],
    reactor : {
      type: 'xmpp',
      protocol: require('kadoh').network.protocol.jsonoverxmlrpc,
      transport : {
        jid : 'kadoh.fr.nf',
        password : null,
        resource : 'kadoh'
      }
    }
  };

  return new KadOH.logic.TwitterNode(null, config);
}

window.createNode = createNode;
