"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serialport_1 = require("serialport");
var parser_readline_1 = require("@serialport/parser-readline");
var socket_io_1 = require("socket.io");
var http_1 = require("http");
var types_1 = require("./types");
var httpServer = (0, http_1.createServer)();
var io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' },
});
httpServer.listen(3000, function () {
    console.log('Socket.IO sunucusu 3000 portunda çalışıyor.');
});
var port = new serialport_1.SerialPort({
    // path: '/dev/cu.usbserial-11420', // Windows "COM5"
    path: 'COM5',
    baudRate: 9600,
});
var parser = port.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\n' }));
parser.on('data', function (line) {
    console.log(line);
    if (line.startsWith('#OUT')) {
        var jsonString = line.replace('#OUT', '');
        try {
            var data = JSON.parse(jsonString);
            for (var _i = 0, EmitFields_1 = types_1.EmitFields; _i < EmitFields_1.length; _i++) {
                var key = EmitFields_1[_i];
                var value = data[key];
                if (value !== undefined) {
                    io.emit(key, value);
                    console.log("G\u00F6nderilen veri: ".concat(key), value);
                }
            }
        }
        catch (err) {
            console.error('JSON parse hatası:', err);
        }
    }
});
port.on('open', function () {
    console.log('Seri port bağlantısı açıldı.');
});
port.on('error', function (err) {
    console.error('Seri port hatası:', err);
});
io.on('connection', function (socket) {
    console.log("\u0130stemci ba\u011Fland\u0131: ".concat(socket.id));
    // 1. pH limits
    socket.on('updatePhLimits', function (limits) {
        if (validateLimits(limits)) {
            port.write(JSON.stringify({ phLimits: limits }) + '\n', function (err) { return errorHandler(err); });
        }
    });
    // 2. EC limits
    socket.on('updateEcLimits', function (limits) {
        if (validateLimits(limits)) {
            port.write(JSON.stringify({ ecLimits: limits }) + '\n', function (err) { return errorHandler(err); });
        }
    });
    // 3. pH up/down/ec pumps duration
    ['phUpPump', 'phDownPump', 'ecPump'].forEach(function (pumpKey) {
        socket.on("update".concat(pumpKey), function (duration) {
            var _a;
            if (typeof duration === 'number' && duration > 0) {
                port.write(JSON.stringify((_a = {}, _a[pumpKey] = { duration: duration }, _a)) + '\n', function (err) { return errorHandler(err); });
            }
        });
    });
    // 4. Water/light onTime-offTime
    ['waterPump', 'lightSource'].forEach(function (deviceKey) {
        socket.on("update".concat(deviceKey), function (payload, callback) {
            var _a;
            if (typeof (payload === null || payload === void 0 ? void 0 : payload.onTime) === 'number' &&
                typeof (payload === null || payload === void 0 ? void 0 : payload.offTime) === 'number') {
                port.write(JSON.stringify((_a = {}, _a[deviceKey] = { onTime: payload.onTime, offTime: payload.offTime }, _a)) + '\n', function (err) { return errorHandler(err); });
                callback({ status: 'ok', receivedAt: Date.now() });
            }
        });
    });
});
function errorHandler(err) {
    if (err) {
        console.log('Error sending data to Arduino:', err);
    }
    port.drain(function () {
        console.log('Veri tamamen gönderildi.');
    });
}
function validateLimits(obj) {
    return (typeof obj.min === 'number' &&
        typeof obj.max === 'number' &&
        typeof obj.target === 'number' &&
        typeof obj.delta === 'number');
}
