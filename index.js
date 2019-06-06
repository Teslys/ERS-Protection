
const Server = require('./server').Server;
const Web = require('./api/web').Web;
const RetroProfile = require("./profiles/RetroProfile").RetroProfile;
const loki = require("lokijs");
const fs = require("fs")

const LOCAL_PORT = 6512
const REMOTE_PORT = 30000
const REMOTE_ADDR = "123.123.123.123";
const API_KEY = "EA185vPQUle1564";


var db = new loki('proxies.json');
if (fs.existsSync("proxies.json"))
    db.loadJSON(fs.readFileSync("proxies.json"))
var proxs = db.addCollection('proxies')
var web = new Web(proxs, API_KEY);

var proxies = proxs.find();
for (var k in proxies) {
    var prox = proxies[k];
    initServer(prox.id, prox.lP, prox.rIP, prox.rP, prox.owner, prox.note)
}

web.events.on("addServer", (id, lP, rIP, rP, owner, note) => {
    var sindb = proxs.insert({
        id: id,
        lP: lP,
        rIP: rIP,
        rP: rP,
        owner: owner,
        note: note
    });
    initServer(id, lP, rIP, rP, owner, note)

})
web.events.on("updatedServer", (id, lP, rIP, rP, owner, note) => {
    web.updateServer(id, lP, rIP, rP, owner, note)
})
web.events.on("removeServer", (id) => {
    proxs.remove(proxs.find({
        id: id
    }))
    web.removeServer(id);
})
web.events.on("attackNotif", (id) => {
    console.log("attack alert", id)
})
web.events.on("save", () => {
    save();
})
function initServer(id, lP, rIP, rP, owner, note) {
    var server = new Server(lP, rIP, rP, owner, note);
    web.attachServer(id, server);
    server.profile = new RetroProfile(server);
    server.listen();
}


process.on('uncaughtException', function (err) {
    // Normalde burası olmamalıydı. Beta sürüm olduğu için bunu koyduk. KALDIRMAYIN!
    console.log(err)
});
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (text) {
    if (text.trim() === 'save') {
        save();
    }
});

function save(){
    var json = db.serialize();
    fs.writeFileSync("proxies.json", json);
}