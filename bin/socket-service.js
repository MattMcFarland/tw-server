var SocketIO = require('socket.io');
var chalk = require('chalk');

function bindListeners(io) {

  io.on('connection', (socket) => {

    console.log(chalk.yellow('socket-io', 'user connection established >_>'));

    io.emit('this', { will: 'be received by everyone'});

    socket.on('test', function (a, b) {
      console.log(chalk.yellow('socket-io', 'test event triggered a=', a, ' b=', b));
      io.emit('test', 'omg', a, b);
    });

    socket.on('disconnect', function () {
      io.emit(chalk.yellow('socket-io', 'user disconnected'));
    });

    socket.on('action', data => console.log(chalk.yellow(data)));

  });

  global.io = io;

}


exports.connectTo = function (server) {
  var io = SocketIO(server);
  bindListeners(io);
}
