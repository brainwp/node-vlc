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
var format = '.mp';
//cfg slave vlc
var slave_url = 'http://192.168.0.103:8080';
var slave_username = '';
var slave_pass = '123';
var slave_dir = 'C:\\Users\\matheus\\Documents\\mp3\\';
var slave_http_auth = util.format('Basic %s',
    new Buffer(slave_username || '' + ':' + slave_pass || '').toString('base64')
);



var parser = new xml2js.Parser();
var req_url = vlc_url + '/requests/status.xml';
if ( typeof atual == 'undefined'){
  atual = '';
}
var list_req = vlc_url + '/requests/playlist.json';
var has_paused = false;
var loop_to_check = function(){
	request ( {url: req_url, headers: { 'Authorization' : http_auth} },
		 function (error, response, body) {
		 	   if ( error || response.statusCode != 200 ) {
		 	   	console.log( 'if 1' );
		 	   	loop_to_check();
		 	   	return;
		 	   }
		 	  parser.parseString(body, function (err, result) {
		 	  	if( typeof result == 'undefined'){
             	 	loop_to_check();
              		return;
            	}
           		if ( typeof result.root.information[0].category[0].info == 'undefined' ) {
              		loop_to_check();
              		return;
            	}
            	if(result.root.state[0] == 'paused' && has_paused == false){
             		console.log(result.root.information[0].category[0].info[4]._);
              		var req_url = slave_url + '/requests/status.xml?command=pl_pause';
             		request( {url: req_url, headers: { 'Authorization' : slave_http_auth} },
                		function (error, response, body) {
                  			if (!error && response.statusCode == 200) {
                    			has_paused = true;
                    			console.log('pausado?');
                			}
                		}
                	);
            	}
            	if(result.root.state[0] == 'playing' && has_paused == true){
             		console.log(result.root.information[0].category[0].info[4]._);
              		var req_url = slave_url + '/requests/status.xml?command=pl_pause';
              		request({url: req_url, headers: { 'Authorization' : slave_http_auth} },
                		function (error, response, body) {
                  			if (!error && response.statusCode == 200) {
                    			has_paused = false;
                   			 	console.log('pausado?');
                  			}
                		}
              		);
            	}
            	request( {url: list_req, headers: { 'Authorization' : http_auth} },
            		function (error, response, body) {
            			if ( error || response.statusCode != 200 ) {
		 	   				loop_to_check();
		 	   				return;
		 	  			}
		 	  			var result = JSON.parse( body );
		 	  			result.children[0].children.forEach( function( value, key )  {
		 	  				if ( typeof value.current != 'undefined' && atual != value.name ) {
		 	  					console.log( 'oi' );
		 	  					var file = value.uri.split( '/' );
		 	  					var file = file[ file.length - 1 ];
		 	  					var req_url = slave_url + '/requests/status.xml?command=in_play&input=' + slave_dir + file;
              						request({url: req_url, headers: { 'Authorization' : slave_http_auth} },
               						 	function (error, response, body) {
                  							if (!error && response.statusCode == 200) {
                  								atual = value.name;
                    							//console.log(body);
                  							}
									});
									console.log( req_url );
		 	  				}
		 	  			} );
            		}
            	);
		 	  });
			 loop_to_check();
		 }
	)
}
loop_to_check();
