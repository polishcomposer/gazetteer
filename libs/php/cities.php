
<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	$executionStartTime = microtime(true) / 1000;
	/*
    $rapidApiKey = "x-rapidapi-key: a2b8543599msh61f31ce8dd35036p1daae4jsn21bf23979fc2";
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);	
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
	curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: geohub3.p.rapidapi.com", $rapidApiKey]);
	curl_setopt($ch, CURLOPT_URL,'https://geohub3.p.rapidapi.com/cities/country/' . $_REQUEST['iso2'] . '?page=1&pageSize=2000');
		$result=curl_exec($ch);
		curl_close($ch);
		$decode = json_decode($result,true);

		*/
		$citiesOut = array();
		$cities = file_get_contents('../js/cities.json');
		$decodedCities = json_decode($cities, TRUE);
		$count = 0;
		for($i = 0; $i< count($decodedCities); $i++) {
			$count+=1;
			if($decodedCities[$i]['country'] == $_REQUEST['iso2']) {
				array_push($citiesOut, $decodedCities[$i]);
				
				if($count==150) { break; }
			}
		}



$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data']['cities'] = $citiesOut;

	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output); 