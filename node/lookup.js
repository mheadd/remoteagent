// Include required modules. 
var net = require('net');
var http = require('http');
var sys = require('sys');

cochDBHost = process.ARGV[2] || "127.0.0.1";
cochDBPort = process.ARGV[3] || 5984;
agiHost = process.ARGV[4] || "127.0.0.1"; 
agiPort = process.ARGV[5] || 4573; 

//An array to hold AGI variables submitted from Asterisk.
var agiVars = new Array();

// Create a TCP server and listen on default FastAGI port.
var server = net.createServer();
sys.puts("Now listening on " + agiHost + ":" + agiPort);
server.listen(agiPort, agiHost);

// HTTP client options for connecting to CouchDB.
var couchDBOptions = {
		host: cochDBHost,
		port: cochDBPort,
		path: '/remoteagent/_design/remoteagent/_view/ready?group=true&limit=1',
		method: 'GET'
};

//Method to access AGI variables submitted from Asterisk.
function setAgiVars(data) {
	var values = data.toString().split("\n");
	for(i=1; i < values.length; i++) {
		var temp = values[i].split(":");
		agiVars[temp[0]] = temp[1];
	}
}

function clearAgiVars() {
	agiVars = [];
}

//Prototype method to create size property for agiVars array.
Array.prototype.size = function () {
	var size = this.length ? --this.length : -1;
		for (var item in this) {
			size++;
		}
	return size;
}

// Add a listener for new TCP connections.
server.addListener('connection', lookupTransferAddress);

// Method to execute AGI logic.
function lookupTransferAddress(stream) {
	
  stream.setEncoding('utf8');
  
  stream.addListener('connect', function() {
  	sys.puts("Got a connection from Asterisk.");
  });
  
  stream.addListener('data', function(data) { 
	  
	  	// When Asterisk starts the AGI script, it will pass channel variables.
	  	if(!agiVars.size()) {
	  		
		  	// Populate agiVars array.
	  		setAgiVars(data);
	  		
			// Write some debug output.
			sys.puts("Getting a call from: " + agiVars["agi_calleridname"]);
			
			// Lookup extension to transfer call to.
			var request = http.request(couchDBOptions);
			request.end();
				
			var json = '';			
			request.on('response', function(response) {			
				response.on('data', function (chunk) {
					json += chunk;
				});
				response.on('end', function() {
					var couchDoc = JSON.parse(json);
					if(couchDoc.rows.length > 0) {
						var transferAddress = couchDoc.rows[0].key;
						sys.puts("Transfering to " + transferAddress);
						stream.end("EXEC Dial SIP/" + transferAddress + "\n");
					}
					else {
						sys.puts("No agents available. Hangup the current channel.");
						stream.end("EXEC Hangup");
					}
				});
			}); 	
	  	}
	  	
	  	else {
	  		sys.puts("Response from Asterisk: " + data);
	  	}	  

  });

  stream.addListener('end', function() {
	  sys.puts("Connection closed.");
	  clearAgiVars();
  });
  
  stream.addListener('error', function() {
	  stream.end();
  });

}

