class Profile {
    constructor(server) {
        this.server = server;
        this.allowedIPs = [];
    }
    allowIP(ip) {
        if (!this.allowedIPs.includes(ip)){
            this.allowedIPs.push(ip);
            this.server.events.emit("allowedIP", ip);
        }
    }
    refuseIP(ip) {
        var index = this.allowedIPs.indexOf(ip);
        if (index > -1) {
            this.allowedIPs.splice(index, 1);
            this.server.events.emit("refusedIP", ip);
        }
    }
    profile() {

    }
}

module.exports = {
    Profile
}