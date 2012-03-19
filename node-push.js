var http = require('http')
  , app = require('express').createServer()
  , io = require('socket.io').listen(app, {log: false})
  , config = require('./config.js')
  , couchChangesListener = require('./couch-changes-listener.js');

app.listen(1234);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/test.html');
});

io.sockets.on('connection', function (socket) {
    
    couchChangesListener.on('change', function(data){
        socket.emit('change', data.chunk);
    });
});

couchChangesListener.listen(config.couchOpts);