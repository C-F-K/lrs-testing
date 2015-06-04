var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/public'));
app.use(express.static(__dirname));
var port = process.env.PORT || 8080;
app.listen(port);
console.log("Server is listening on port " + port);