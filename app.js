var bodyParser    = require('body-parser');
var express 	  = require('express');
var redis         = require('redis');
var rp            = require('request-promise');

var app           = express()
//var client      = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

// assign app settings from envvironment || defaults
const port    = process.env.PORT || 8080;
const name    = process.env.HEROKU_APP_NAME || 'Unknown Name';
const version = process.env.HEROKU_RELEASE_VERSION || 'Unknown Version';

const BTC_ADDR = process.env.BTC_ADDRESS_LIST || '3C8667tWtc9tLU3Fhp8J1u2NQ9fXijS8AM';

// parse application/json
app.use(bodyParser.json())

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {
    res.json({"name": name,"version": version}); 	
});

//
// Retrieve last transaction sent to pre-sale/sale BTC address
//
app.post('/transaction/update', function(req, res) {
    const url = "https://blockchain.info/address/" + BTC_ADDR + "?format=json";
    var options = {
       uri: url,
       json: true
    };
    rp(options).then(function(body) {
        const txn  = body.result[0];
        const ts = +new Date()
        const sender = body.result[0].from;
        res.json({"sender": sender, "txn": txn, "timestamp": ts, "count": body.result.length}); 	
    })
    .catch(function (err) {
        res.status(500);
    });
});

//
// Retrieve total transactions sent to BTC address
//
app.get('/transaction/total', function(req, res) {
    const uri = "https://blockchain.info/balance/" + BTC_ADDR + "?format=json";
    var options = { 
       uri: url,
       json: true
    };
    rp(options).then(function(body) {
        const total = body.result;
        const ts = +new Date()
        res.json({"currency": "BTC","total": total, "timestamp": ts});
    })
    .catch(function (err) {
        res.status(500);
    });
});

// Start the app listening to default port
app.listen(port, function() {
   console.log(name + ' app is running on port ' + port);
});
