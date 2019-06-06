const express = require('express')
const EventEmitter = require('events');
const bodyParser = require('body-parser');
var os = require('os-utils');

class Web {
    constructor(db, apiKey) {
        this.db = db;
        this.cpu = 0;
        this.ram = 0;
        this.resCheck = setInterval(() => {
            os.cpuUsage((v) => {
           this.cpu = Math.floor(v * 100) / 100, "ram";
           this.ram = 100 - (100* os.freememPercentage()); 
        })
        }, 5000)
        this.servers = [];
        this.apiKey = apiKey;
        this.app = express()
        this.port = 3000;
        this.events = new APIEvents();
        this.app.use(bodyParser.json())

        var _this = this;
        this.app.get("/*", (req, res, next) => { return this.validate(req, res, next) }, (req, res) => {
            _this.cors(res);
            this.events.emit("get", req, res)
        });
        this.app.post("/*", (req, res, next) => { return this.validate(req, res, next) }, (req, res) => {
            _this.cors(res);
            this.events.emit("post", req, res)
        });
        this.app.options("/*", function (req, res, next) {
            _this.cors(res)
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.sendStatus(200);
        });
        this.pages();
        this.listen();
    }
    cors(res) {

        res.set("Access-Control-Allow-Origin", "http://25.21.94.14")
    }
    removeServer(id) {
        this.servers = Object.keys(this.servers).reduce((object, key) => {
            if (key !== id) {
                object[key] = this.servers[key]
            } else {
                this.servers[key].stop();
            }
            return object
        }, {})
        this.events.emit("save");
    }
    attachServer(name, s) {
        this.servers[name] = s;
        s.events.on("onAttack", () => {
            events.emit("attackNotif", name);
        });
    }
    validate(req, res, next) {
        if (typeof req.query != "undefined" &&
            typeof req.query.apiKey != "undefined" &&
            req.query.apiKey == this.apiKey)
            next();
        else
            res.status(401).end();
    }
    listen() {
        this.wserver = this.app.listen(this.port, () => { this.events.emit("webListening") });
    }
    stop() {
        this.wserver.close();
        this.events.emit("webClosed")
    }
    updateServer(id, lP, rIP, rP, owner, note) {
        var s = this.servers[id];
        if (!checkValue(s, null))
            return;
        if (s.lP != lP) {
            s.lP = lP;
            s.stop();
            s.listen();
        }
        s.rIP = rIP;
        s.rP = rP;
        s.owner = owner;
        s.note = note;

        var sindb = this.db.find({
            id: id
        })

        sindb.rIP = rIP;
        sindb.rP = rP;
        sindb.owner = owner;
        sindb.note = note;

        this.db.update(sindb);
        this.events.emit("save");
    }
    pages() {
        var e = this.events;
        e.on("get", (req, res) => {
            var path = req.path;
            if (path == "/admin/getList") {
                var id = (checkValue(req.query.id, null)) ? req.query.id : -1;
                if (id == -1) {
                    var list = {};
                    for (var k in this.servers) {
                        var s = this.servers[k];
                        list[k] = {
                            "id": k,
                            "onAttack": s.onAttack,
                            "localPort": s.lP,
                            "remoteIP": s.rIP,
                            "remotePort": s.rP,
                            "lastBlockedCount": s.anormalBlockedIPCount,
                            "owner": s.owner,
                            "note": s.note
                        }
                    }
                    res.json(list);
                } else {
                    var list = {};
                    var s = this.servers[req.query.id];
                    if (!checkValue(s, res))
                        return;
                    list[req.query.id] = {
                        "id": req.query.id,
                        "onAttack": s.onAttack,
                        "localPort": s.lP,
                        "remoteIP": s.rIP,
                        "remotePort": s.rP,
                        "lastBlockedCount": s.anormalBlockedIPCount,
                        "owner": s.owner,
                        "note": s.note,
                        "lastIPsBlocked": s.blockedIPsPerTime
                    }
                    res.json(list);
                }
                return;
            }


            if (path == "/admin/removeServer") {
                if (!checkValue(req.query.id, res)
                )
                    return;
                this.events.emit("removeServer", req.query.id);
                res.json({ "res": "succ" })
                return;
            }
            if (path == "/admin/save") {
                this.events.emit("save");
                res.json({ "res": "succ" })
                return;
            }
            if (path == "/admin/resources") {
                    res.json({ "cpu": this.cpu, "ram": this.ram})
                return;

            }
            if (!checkValue(req.query.id, res))
                return;
            var s = this.servers[req.query.id];
            if (!checkValue(s, res))
                return;
            switch (path) {
                case "/onAttack":


                    s.server.getConnections(function (error, count) {
                        res.json({
                            "onAttack": s.onAttack,
                            "lastBlockedCount": s.blockedIPsPerTime.length,
                            "activeConnections": count
                        });
                    });
                    break;
                default:
                    res.status(404).send();
                    break;
            }
        });
        e.on("post", (req, res) => {
            var data = req.body;
            var path = req.path;

            if (path == "/admin/addServer") {
                if (!checkValue(data.id, res) ||
                    !checkValue(data.lP, res) ||
                    isNaN(data.lP) ||
                    !checkValue(data.rIP, res) ||
                    !ValidateIPaddress(data.rIP) ||
                    !checkValue(data.rP, res) ||
                    isNaN(data.rP) ||
                    !checkValue(data.owner, res) ||
                    !checkValue(data.note, res)
                )
                    return;
                var id = data.id;
                var lP = parseInt(data.lP);
                var rIP = data.rIP;
                var rP = parseInt(data.rP);
                var owner = data.owner;
                var note = data.note;
                this.events.emit("addServer", id, lP, rIP, rP, owner, note);
                this.events.emit("save");
                res.json({ "res": "succ" })
                return;
            }
            if (path == "/admin/updateServer") {
                if (!checkValue(data.id, res) ||
                    !checkValue(data.lP, res) ||
                    isNaN(data.lP) ||
                    !checkValue(data.rIP, res) ||
                    !ValidateIPaddress(data.rIP) ||
                    !checkValue(data.rP, res) ||
                    isNaN(data.rP) ||
                    !checkValue(data.owner, res) ||
                    !checkValue(data.note, res)
                )
                    return;
                var id = data.id;
                var lP = parseInt(data.lP);
                var rIP = data.rIP;
                var rP = parseInt(data.rP);
                var owner = data.owner;
                var note = data.note;
                this.events.emit("updatedServer", id, lP, rIP, rP, owner, note);
                res.json({ "res": "succ" })
                return;
            }



            if (!checkValue(req.query.id, res))
                return;
            var s = this.servers[req.query.id];

            if (!checkValue(s, res))
                return;

            switch (path) {
                case "/ips/allow":
                    if (checkValue(data.ip, res)) {
                        s.profile.allowIP(data.ip);
                        res.json({ "res": "ok" })
                    }
                    break;
                case "/ips/refuse":
                    if (checkValue(data.ip, res)) {
                        s.profile.refuseIP(data.ip);
                        res.json({ "res": "ok" })
                    }
                    break;
                default:
                    res.status(404).send();
                    break;
            }
        });
    }
}
function ValidateIPaddress(ipaddress) {
    if (/^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/.test(ipaddress)) {
        return (true)
    }
    return (false)
}
function checkValue(val, res) {
    if (typeof val == "undefined" || val == "") {
        if (res != null) res.json({ "res": "err", "msg": "Unrecognized request" });
        return false;
    }
    return true;
}
class APIEvents extends EventEmitter { }

module.exports = {
    Web
}

function cpuAverage() {

    //Initialise sum of idle and time of cores and fetch CPU info
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();

    //Loop through CPU cores
    for (var i = 0, len = cpus.length; i < len; i++) {

        //Select CPU core
        var cpu = cpus[i];

        //Total up the time in the cores tick
        for (type in cpu.times) {
            totalTick += cpu.times[type];
        }

        //Total up the idle time of the core
        totalIdle += cpu.times.idle;
    }

    //Return the average Idle and Tick times
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}