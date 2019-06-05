const express = require('express')
const EventEmitter = require('events');
const bodyParser = require('body-parser');

class Web {
    constructor(apiKey) {
        this.servers = [];
        this.apiKey = apiKey;
        this.app = express()
        this.port = 3000;
        this.events = new APIEvents();
        this.app.use(bodyParser.json())
        this.app.get("/*", (req, res, next) => { return this.validate(req, res, next) }, (req, res) => {
            this.events.emit("get", req, res)
        });
        this.app.post("/*", (req, res, next) => { return this.validate(req, res, next) }, (req, res) => {
            this.events.emit("post", req, res)
        });
        this.pages();
        this.listen();
    }
    attachServer(name, s){
      this.servers[name] = s;
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

    pages() {
        var e = this.events;
        e.on("get", (req, res) => {
            var path = req.path;
	    if(typeof req.query.id == "undefined" || typeof this.servers[req.query.id] == "undefined"){
		 res.json({ "res": "err", "msg": "Unrecognized request" });
		console.log(req.query);		
		
	    	return;
	    }
	    var s = this.servers[req.query.id];
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
            switch (path) {
                case "/ips/allow":
                    if (typeof data.ip == "undefined" || !ValidateIPaddress(data.ip))
                        res.json({ "res": "err", "msg": "Unrecognized request" });
                    else {
                        s.profile.allowIP(data.ip);
                        res.json({ "res": "ok" })
                    }
                    break;
                case "/ips/refuse":
                    if (typeof data.ip == "undefined" || !ValidateIPaddress(data.ip))
                        res.json({ "res": "err", "msg": "Unrecognized request" });
                    else {
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
class APIEvents extends EventEmitter { }

module.exports = {
    Web
}
