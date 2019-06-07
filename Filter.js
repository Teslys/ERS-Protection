class Filter {
    constructor(server){
        this.server = server;
    }
    check(ip){
        return true;
    }
}

module.exports = {
    Filter
}