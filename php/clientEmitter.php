<?php


$ip = $_SERVER["REMOTE_ADDR"];
$id = "machine-1";
$pass = "15A1v8Ue4v5Q";
$url = "http://example.com/emitIP.php?id=" . $id . "&ip=" . $ip & "&customerPass=" . $pass;

$ch = curl_init();
curl_setopt($ch,CURLOPT_URL, $url);
curl_setopt($ch,CURLOPT_RETURNTRANSFER, true); 

$result = curl_exec($ch);
