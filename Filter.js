class Filter {
    constructor(server, filter){
        this.server = server;
        this.filter = filter;
    }
    check(ip){
        return true;
    }
    stop(){

    }
}

module.exports = {
    Filter
}