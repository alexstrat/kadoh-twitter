var browserify = require("browserify"),
    browserijade = require("browserijade"),
    connect = require('connect'),
    http = require('http'),
    jade = require('jade'),
    tagify = require('tagify'),
    fs = require('fs'),
    uglify = require('uglify-js'),
    dgram = require('dgram');

//configuation :
var prod = process.env.NODE_ENV &&
           process.env.NODE_ENV === 'production';
var transport = 'xmpp';

//client side javascript
var new_bundle = function() {
  return browserify({
            cache  : false,
            debug  : !prod,
            filter : !prod ? String : function(src) {
              var ast = uglify.parser.parse(src);
              ast = uglify.uglify.ast_mangle(ast);
              ast = uglify.uglify.ast_squeeze(ast);

              return uglify.uglify.gen_code(ast, { ascii_only: true });
            }
          })
         .use(browserijade(__dirname + "/views/templates",
            ['index.jade'], {debug : false}))
         .use(tagify.flags([transport, 'lawnchair']))
         .addEntry(__dirname + '/app-client.js')
         .bundle();
};

//index html
var new_index = function() {
  var _index = jade.compile(
    fs.readFileSync(__dirname + '/views/templates/index.jade'));
  return _index({
   transport : transport,
   reporter : prod,
   logger : !prod
  });
};

function cubeProxy(options) {
  options = options || {};
  var host = options.host || 'localhost',
      port = options.port || 1180,
      socket = dgram.createSocket('udp4');
  return function(req, res, next) {
    if (req.method === 'POST') {
      var buf = '';
      req.on('data', function(chunk) { buf += chunk; });
      req.on('end', function() {
        socket.send(new Buffer(buf), 0, buf.length, port, host);
        res.end();
      });
    } else {
      next();
    }
  };
}

//cache
_cache_bundle = new_bundle();
_cache_index = new_index();

//connect application
var app = connect.createServer()
                 .use('/1.0/event', cubeProxy())
                 .use('/app.js', function(req, res) {
                    res.statusCode = 200;
                    res.setHeader('content-type', 'text/javascript');
                    res.end(prod ? _cache_bundle : new_bundle());
                 })
                 .use(connect.static(__dirname + '/dist'))
                 .use('/', function(req, res) {
                    res.statusCode = 200;
                    res.setHeader('content-type', 'text/html');
                    res.end(prod ? _cache_index : new_index());
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