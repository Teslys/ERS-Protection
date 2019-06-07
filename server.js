var net = require('net');
const EventEmitter = require('events');
const Profile = require("./Profile").Profile;
class Server {
    constructor(listeningPort, remoteIp, remotePort, owner, note) {
        if (typeof owner == "undefined")
            owner = null;
        if (typeof note == "undefined")
            note = null;
        this.owner = owner;
        this.note = note;

        this.anormalBlockedIPCount = 20;
        this.onAttack = false;
        this.interval = setInterval(() => { this.checkByTime(); }
            , 1000 * 60);
        this.blockedIPsPerTime = [];
        this.lP = listeningPort;
        this.rIP = remoteIp;
        this.rP = remotePort;
        this.events = new OnEvents();
        this.profile = new Profile(this);
        this.check = (socket) => { return true; }
        this.server = net.createServer((socket) => { this._handleSocket(socket) });
        this.server.on("error", (err) => this.events.emit("nError".err));
    }
    checkByTime() {
        if (this.blockedIPsPerTime.length >= this.anormalBlockedIPCount) {
            this.onAttack = true;
            this.events.emit("attack", this.blockedIPsPerTime);
        } else {
            this.onAttack = false;
        }

        this.blockedIPsPerTime = [];
    }
    listen() {
        this.server.listen(this.lP);
        this.events.emit("listening", this.server)
    }
    stop() {
        this.server.close();
        this.events.emit("closed", this.server);
        clearInterval(this.interval);
    }
    addBlockedReport(ip) {
        if (this.blockedIPsPerTime.includes(ip))
            return;
        this.blockedIPsPerTime.push(ip);
    }
    _handleSocket(socket) {
        var client;
        socket.setKeepAlive(true, 1000);
        var ip = socket.remoteAddress.replace(/^.*:/, '');
        socket.ip = ip;
        this.events.emit("connected", socket)
        if (!this.check(socket)) {
            this.addBlockedReport(socket.ip);
            this.events.emit("refused", socket)
            socket.destroy();
            return;
        }

        this.events.emit("accepted", socket)
        client = net.connect(this.rP, this.rIP);

        socket.pipe(client).pipe(socket);

        socket.on('close', () => {
            this.events.emit("close", socket);
        });
        socket.on('end', () => {
            this.events.emit("end", socket);
        });

        socket.on('error', () => {
            this.events.emit("error", socket);
        });
    }
}

class OnEvents extends EventEmitter { }

module.exports = {
    Server
}