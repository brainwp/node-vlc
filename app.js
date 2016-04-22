// importa modulos necessarios para rodar o script
var xml2js = require('xml2js');
var request = require('request');
var util = require('util');

// configuração do servidor master
var vlc_url = 'http://localhost:8080';
var vlc_username = '';
var vlc_pass = '123';
var http_auth = util.format('Basic %s',
		new Buffer(vlc_username || '' + ':' + vlc_pass || '').toString('base64')
);
// configuração do servidor slave
var slave_url = 'http://192.168.1.41:8080';
var slave_username = '';
var slave_pass = '123456';
var slave_dir = '/home/brasa/Documentos/BRASA/IO/changing_climate/';
var slave_http_auth = util.format('Basic %s',
		new Buffer(slave_username || '' + ':' + slave_pass || '').toString('base64')
);

// definição de variaveis
var parser = new xml2js.Parser();
var req_url = vlc_url + '/requests/status.xml';
if ( typeof atual == 'undefined'){
	atual = 'init';
}
var list_req = vlc_url + '/requests/playlist.json';
var has_paused = false;

var loop_to_check = function(){
	// inicia um request na maquina master para verificar o status
	request ( {url: req_url, headers: { 'Authorization' : http_auth} },
		 function (error, response, body) {
				 if ( error || response.statusCode != 200 ) {
				 		// se a resposta da maquina master for um erro, retorna ao inicio
						loop_to_check();
						return;
				 }

				// convert a string XML para variaveis de JavaScript
				parser.parseString(body, function (err, result) {
					// se der erro, volta ao inicio
					if( typeof result == 'undefined'){
								return;
							}

							// verifica se a maquina master está pausada, se estiver manda um request pausando o slave
							if(result.root.state[0] == 'paused' && has_paused == false){
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
							// verifica se a maquina master está parada (stop), se estiver manda um request parando o slave
							if(result.root.state[0] == 'stopped' && has_paused == false){
									var req_url = slave_url + '/requests/status.xml?command=pl_stop';
								request( {url: req_url, headers: { 'Authorization' : slave_http_auth} },
										function (error, response, body) {
												if (!error && response.statusCode == 200) {
													has_paused = true;
													console.log('pausado?');
											}
										}
									);
							}
							// verifica se a maquina master voltou a tocar, se sim, manda um request fazendo o slave iniciar
							if(result.root.state[0] == 'playing' && has_paused == true){
									var req_url = slave_url + '/requests/status.xml?command=pl_pause';
									request({url: req_url, headers: { 'Authorization' : slave_http_auth} },
										function (error, response, body) {
												if (!error && response.statusCode == 200) {
													has_paused = false;
													console.log('pausado?');
												}
												else {
													console.log( 'error?' );
												}
										}
									);
							}
							// faz um request para verificar o arquivo sendo reproduzido atualmente no master
							request( {url: list_req, headers: { 'Authorization' : http_auth} },
								function (error, response, body) {
									if ( error || response.statusCode != 200 ) {
								return;
							}
							// transforma a string JSON para objeto do JavaScript
							var result_playlist = JSON.parse( body );

							// faz um loop em cada um dos indices no array de arquivos reproduzidos para procurar o atual
							result_playlist.children[0].children.forEach( function( value, key )  {
								// verifica se o arquivo está atualmente sendo tocado, se for diferente da variavel atual, inicia um request trocando no slave
								if ( typeof value.current != 'undefined' && atual != value.name  ) {
									// limpa a variavel com o nome e extensão do arquivo
									var file = value.uri.split( '/' );
									var file = file[ file.length - 1 ];
									// faz uma requisição tocando o arquivo atual
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
		 }
	)
}
// faz um loop que a cada 1 segundo faz a verificação do VLC
setInterval( function(){ loop_to_check() }, 1000 );
