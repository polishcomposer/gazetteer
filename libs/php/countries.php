<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
$executionStartTime = microtime(true) / 1000;
$countries = file_get_contents('../js/countryBorders.geo.json');
   $countriesInfo = []; 
	$decodedBorders = json_decode($countries, TRUE);
    foreach($decodedBorders['features'] as $key => $value) {
        if($value['properties']['iso_a2']!=-99) {
            $countriesInfo[$value['properties']['iso_a2']] = $value['properties']['name'];
        }
    }
    asort($countriesInfo);
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $countriesInfo;

	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output); 
?>