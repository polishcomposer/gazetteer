
<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	$executionStartTime = microtime(true) / 1000;

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