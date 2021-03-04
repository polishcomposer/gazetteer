<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	$executionStartTime = microtime(true) / 1000;
    $rapidApiKey = "x-rapidapi-key: a2b8543599msh61f31ce8dd35036p1daae4jsn21bf23979fc2";
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);	
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
  	curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com", $rapidApiKey]);	
	curl_setopt($ch, CURLOPT_URL,'https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/news/get-coronavirus-news/1');

		$result=curl_exec($ch);
		curl_close($ch);
		$decode = json_decode($result,true);
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['covidNews'] = $decode;

	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output); 
?>