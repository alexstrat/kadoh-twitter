var browserify = require("browserify"),
    browserijade = require("browserijade"),
    connect = require('connect'),
    http = require('http'),
    jade = require('jade'),
    tagify = require('tagify'),
    fs = require('fs');

//configuation :
var transport = 'simudp';

//client side javascript
var new_bundle = function(transport) {
  return browserify({cache : false, debug : true})
         .use(browserijade(__dirname + "/views/templates",
            ['index.jade'], {debug : false}))
         .use(tagify.flags([transport, 'lawnchair']))
         .addEntry(__dirname + '/app-client.js')
         .bundle();  
};

//connect application
var app = connect.createServer()
                 .use('/app.js', function(req, res) {
                    res.statusCode = 200;
                    res.setHeader('content-type', 'text/javascript');
                    res.end(new_bundle(transport));
                 })
                 .use(connect.static(__dirname + '/dist'))
                 .use('/', function(req, res) {

                   //index rendering
                   var _index = jade.compile(
                     fs.readFileSync(__dirname + '/views/templates/index.jade'));
                   var index = _index({transport : transport});

                   res.end(index);
                 });

//http server
var server = http.createServer(app);

//udp proxy if needded
if(transport === 'simudp') {
  var proxy = require('../node_modules/kadoh/lib/server/udpproxy');
  proxy.listen(server);
}

//exports
module.exports.server = server;
module.exports.app = app;
module.exports.proxy = proxy;

//direct run if main module
if(require.main === module) {
  server.listen(8080);
  console.log('http://localhost:8080');
}