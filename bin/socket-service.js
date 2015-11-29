var SocketIO = require('socket.io');
var chalk = require('chalk');

function bindListeners(io) {

  io.on('connection', function(socket){
    console.log(chalk.magenta('a user connected'));
  });

}


exports.connectTo = function (server) {
  var io = SocketIO(server);
  bindListeners(io);
}
