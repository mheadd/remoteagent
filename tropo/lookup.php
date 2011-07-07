<?php

// CouchDB settings.
define("COUCHDB_HOST","http://127.0.0.1");
define("COUCHDB_PORT","5984");
define("COUCHDB_VIEW","ready");

// Method to retrieve available agent listing from CouchDB.
function lookupAgent() {
    $url = COUCHDB_HOST.":".COUCHDB_PORT."/remoteagent/_design/remoteagent/_view/".COUCHDB_VIEW;
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HTTPGET, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$result = curl_exec($ch);
	$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	if ($code != '200') {
		return false;
	}
	return $result;
}

try {
answer();

    // Look up the list of agents.
    $agentList = lookupAgent();
    
    if($agentList) {
      $agents = json_decode($agentList);
      
      // If no agents availalbe, tell the caller.
      if(count($agents->rows) == 0) {
        say("Sorry, no agents available.");
      }
      // Otherwise, send IM screen pop and transfer to the agent Phono instance.
      else {
        $agent = $agents->rows[0]->key;
        $callerID = $currentCall->callerID;
        message("Incoming call from $callerID", array("network" => "JABBER", "to" => $agent));
        say("Please hold while your call is transferred.");
        transfer($agent);
      }
    }
    // No response from CouchDB instance.
    else 
      say("Sorry, no agents available.");
    }
  hangup();
}

catch (Exception $ex) {
  say("Sorry, there was a problem.");
  hangup();
}

?>