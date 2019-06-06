<?php
class ERSProtection {
	function __construct($id, $host,$port, $apiKey){
		$this->id = $id;
		$this->host = $host;
		$this->port = $port;
		$this->apiKey = $apiKey;
	} 
	
	function allowIP($ip){
		$url = "http://" . $this->host . ":" . $this->port . "/ips/allow?apiKey=" . $this->apiKey . "&id=" . $id;
		$fields = [
		    'ip'      => $ip
		];
		$fields_string = json_encode($fields);
		$ch = curl_init();
		curl_setopt($ch,CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
		curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));

		curl_setopt($ch,CURLOPT_RETURNTRANSFER, true); 

		$result = curl_exec($ch);
		return $result;
	}
}