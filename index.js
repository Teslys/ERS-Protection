
const Server = require('./server').Server;
const Web = require('./api/web').Web;
const RetroProfile = require("./profiles/RetroProfile").RetroProfile;

const LOCAL_PORT = 6512
const REMOTE_PORT = 30000
const REMOTE_ADDR = "123.123.123.123";
const API_KEY = "1UqcAn943MAAT6";

var server = new Server(LOCAL_PORT, REMOTE_ADDR, REMOTE_PORT);
var web = new Web(API_KEY);
web.attachServer("default", server);
server.profile = new RetroProfile(server);
server.events.on("allowedIP", (ip) => {
    
})

server.listen();


process.on('uncaughtException', function (err) {
    // Normalde burası olmamalıydı. Beta sürüm olduğu için bunu koyduk. KALDIRMAYIN!
    console.log(err)
});

