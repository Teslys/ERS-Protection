const Filter = require('../Filter').Filter;

class FloodFilter extends Filter {
    constructor(server) {
        super(server);
        this.events();
        this.ips = {};
        this.debug = false;
        this.MAX_AMOUNT = 5;
        this.TOO_MANY_IPS = 100000;
    }
    countIPConnect(ip) {
        if (typeof this.ips[ip] == "undefined")
            this.ips[ip] = 1;
        else
            this.ips[ip]++;
    }
    countIPDisonnect(ip) {
        if (typeof this.ips[ip] == "undefined")
            return;
        if (this.ips[ip] == 1) {
            this.ips = Object.keys(this.ips).reduce((object, key) => {
                if (key !== ip) {
                    object[key] = this.ips[key]
                }
                return object
            }, {});
        } else
            this.ips[ip]--;
        if (this.debug) {
            console.log(this.ips);
        }
    }
    events() {
        this.server.events.on("connected", (socket) => {
            this.countIPConnect(socket.ip)
        })
        this.server.events.on("close", (socket) => {
            this.countIPDisonnect(socket.ip)
        })
        this.server.events.on("end", (socket) => {
            this.countIPDisonnect(socket.ip)
        })
    }
    check(ip) {
        if(this.ips.length >= this.TOO_MANY_IPS){
            this.ips = {};
        }
        if (typeof this.ips[ip] == "undefined")
            return true;
        else if (this.ips[ip] >= this.MAX_AMOUNT){
            this.server.addBlockedReport(ip);
            this.server.profile.refuseIP(ip);

            return false;
        }
        return true;
    }
}

module.exports = {
    FloodFilter
}