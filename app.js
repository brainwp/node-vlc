var xml2js = require('xml2js');
var request = require('request');
var util = require('util');

//cfg
var vlc_url = 'http://localhost:8080';
var vlc_username = '';
var vlc_pass = '123';

var http_auth = util.format('Basic %s', 
    new Buffer(vlc_username || '' + ':' + vlc_pass || '').toString('base64')
);


 
var parser = new xml2js.Parser();
var req_url = vlc_url + '/requests/status.xml';
var loop_to_check = function(){
  setTimeout(function(){
    var _result = null;
    request({url: req_url, headers: { 'Authorization' : http_auth} },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          parser.parseString(body, function (err, result) {
            console.log(result);
          });     
        }
      });
    loop_to_check();
  }, 2000);
}
loop_to_check();