<?php


	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	$executionStartTime = microtime(true) / 1000;
	switch($_REQUEST['request']) {
		case 1:
			$url = 'https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['lat'] . '+' . $_REQUEST['lng'] . '&language=en&key=498bd3e565df4d96bae3772c99e7eda0';
			break;
		case 2:
			$url ='http://api.worldbank.org/v2/country/' . $_REQUEST['col'] . '?format=json';
			break;
		case 3:
			$url ='../js/countryBorders.geo.json'; 
			break;
		case 4:
			$url ='https://restcountries.eu/rest/v2/alpha/' . $_REQUEST['col']; 
			break;
		case 5:
			$url = 'https://geohub3.p.rapidapi.com/cities/country/' . $_REQUEST['ab'] . '?page=1&pageSize=2000&sort=desc&orderBy=population';
			break;
		case 6:
			$url = 'https://airportix.p.rapidapi.com/airport/country_code/' . $_REQUEST['ab'] . '/%7Bclassification%7D';
			break;
		case 7:
			$url = 'https://travelbriefing.org/' . $_REQUEST['ab'] . '?format=json';
			break;
		case 8:
			$url = 'https://calendarific.com/api/v2/holidays?&api_key=2adeac4fe82f4d26180b4fba95220aaae0cf7cc8&country=' . $_REQUEST['ab'] . '&year=2021';
			break;
		case 9:
			$url = 'https://pixabay.com/api/?key=3853087-8c2a07a3d1d9a8e2ac4f750a3&q=' . $_REQUEST['countryName'] . '+city&image_type=photo&per_page=3';
			break;
		case 10:
			$url = 'http://api.openweathermap.org/data/2.5/group?id=' . $_REQUEST['cities'] . '&units=metric&appid=d585e08b3b66222fc518c1729559ec1c';
			break;
		case 11:
			$url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng'] . '&exclude=minutely,hourly&units=metric&appid=d585e08b3b66222fc518c1729559ec1c';
			break;
		case 12:
			$url = 'https://us1.locationiq.com/v1/reverse.php?key=pk.284d0ca5dc7bcb9d1b70803df62c8a1a&format=json&lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng']; 
			break;
		case 13:
			$url = 'https://corona-api.com/countries/' . $_REQUEST['ab'];
			break;
		case 14:
			$url = 'https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/news/get-coronavirus-news/1';
			break;
		case 15:
			$url = 'http://api.geonames.org/findNearbyWikipediaJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=polishcomposer';
			break;
		case 16:
			$url = 'https://api.thenewsapi.com/v1/news/all?api_token=fQEQRdYwJLmUnc9tYo6OfVpj5axkUhemNSolOjE4&language=en&search=' . $_REQUEST['countryName'];
			break;
		case 17:
			$url = 'https://openexchangerates.org/api/currencies.json';
			break;
		case 18:
			$url = 'https://v6.exchangerate-api.com/v6/1fd409d26cd54a899c31e939/pair/' . $_REQUEST['base'] . '/' . $_REQUEST['symbol'];
			break;		
		
			
			default:
			break;
	}
	
	$rapidApiKey = "x-rapidapi-key: a2b8543599msh61f31ce8dd35036p1daae4jsn21bf23979fc2";
    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	if($_REQUEST['request']==4) {
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: wft-geo-db.p.rapidapi.com", $rapidApiKey]);
	} else if($_REQUEST['request']==5) {
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: geohub3.p.rapidapi.com", $rapidApiKey]);	
	} else if($_REQUEST['request']==6) {
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: airportix.p.rapidapi.com", $rapidApiKey]);	
	} else if($_REQUEST['request']==14) {
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com", $rapidApiKey]);	
	}
	
	$result=curl_exec($ch);
	curl_close($ch);
	if($_REQUEST['request']==3) {
		$myFIle = file_get_contents($url);
		    $decode = json_decode($myFIle,true);
		} else {
			$decode = json_decode($result,true);
		}
		
	$output['status']['code'] = "200";
	$output['status']['name'] = "ok";
	$output['status']['description'] = "mission saved";
	$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $decode;

		header('Content-Type: application/json; charset=UTF-8');
		echo json_encode($output); 
		

	

?>