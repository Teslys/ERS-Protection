<?php
require_once("ers-protection.php");

$customers = array(
    "machine-1" => "15A1v8Ue4v5Q"
);
if(isset($_GET["ip"]) && isset($_GET["customerPass"]) && isset($_GET["id"]) && in_array($_GET["id"], $customers)){
    $id = $_GET["id"];
    if($_GET["customerPass"] == $customers[$id])
    {
        $host = "123.123.123.123"; // proxy server ip
        $port = 3000;
        $apiKey = "EA185vPQUle1564";

        $pro = new ERSProtection($id, $host, $port, $apiKey);
        $pro->allowIP($ip);
    }
}