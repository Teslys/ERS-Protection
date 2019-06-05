# ERS Protection
[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

ERS Protection helps you to protect your TCP Socket with Allow/Refuse IP Method.

  - Allowing and  refusing IPs dynamically
  - You are able to see if there is an attack on the socket with REST API
  - You can customize your own profile
  - And you can use events that are built

# Event List
- webListening (Web.js) [Web server listens]
- webClosed (Web.js)
- allowedIP (Profile.js) [An IP is added to allowed IP list]
- refusedIP (Profile.js)
- nError (server.js) [An 'net' class error has been occurred]
- listening (server.js) [TCP Socket listens]
- closed (server.js)
- attack (server.js) [An attack has been detected]
- connected (server.js) [Someone has connected to socket]
- refused (server.js) [Someone was refused]
- accepted (server.js)
- close (server.js) [An socket has been closed]
- error (server.js) [An error has been occured while handling the socket]

# Web API
## GET /onAttack
That returns is socket being attacked. And returns (unique) IP count that have been refused in last minute.
Result:
~~~json
{ "onAttack": true, "lastBlockedCount": 56, "activeConnections": 10}
~~~
## POST /ips/allow
This helps you to allow an IP.
Payload:
~~~json
{ "ip": "123.123.123.123" }
~~~
Result:
~~~json
{ "result": "succ" }
~~~
~~~json
{ "result": "err", "msg": "..." }
~~~
## POST /ips/refuse
This helps you to refuse(after allowing an IP) the IP.
Payload:
~~~json
{ "ip": "123.123.123.123" }
~~~
Result:
~~~json
{ "result": "succ" }
~~~
~~~json
{ "result": "err", "msg": "..." }
~~~