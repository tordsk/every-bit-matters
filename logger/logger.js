var speedtest = require('speedtest-net');
var fileSystem = require('fs');
var fileName = __dirname + '/history.json';
var history = JSON.parse(fileSystem.readFileSync(fileName));
var url = 'http://localhost:3000';
var socket = require('socket.io-client')(url);

socket.on('connect', function () {
    console.log('Logger is connected');
});

socket.on('logger:history', function () {
    socket.emit('server:results', history);
});

socket.on('logger:run', function () {
    console.log('Starting speedtest...');
    
    var test = speedtest();

    test.on('data', function (data) {
        var result = {
            download: data.speeds.download,
            upload: data.speeds.upload,
            ping: data.server.ping,
            date: Date.now()
        };

        history.push(result);
        socket.emit('server:results', history);

        var jsonResult = JSON.stringify(history);
        fileSystem.writeFile(fileName, jsonResult, function (err) {
            if (err) {
                console.log('Something went wrong: ' + err);
            } else {
                console.log('Speedtest finished');
            }
        });
    });

    test.on('error', function (err) {
        console.error(err);
    });
});