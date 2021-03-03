<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL);
	$executionStartTime = microtime(true) / 1000;
	if($_REQUEST['change']==1) {
	$url = 'http://api.worldbank.org/v2/country/' . $_REQUEST['iso2'] . '?format=json';
	$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_URL,$url);
		$resultC=curl_exec($ch);
		curl_close($ch);
		$decodeC = json_decode($resultC,true);
		$requestLat = $decodeC[1][0]['latitude'];
		$requestLng = $decodeC[1][0]['longitude'];
	} else { 
		$requestLat = $_REQUEST['lat'];
		$requestLng = $_REQUEST['lng'];
	}
	$rapidApiKey = "x-rapidapi-key: a2b8543599msh61f31ce8dd35036p1daae4jsn21bf23979fc2";

$urls = ['https://api.opencagedata.com/geocode/v1/json?q=' . $requestLat . '+' . $requestLng . '&language=en&key=498bd3e565df4d96bae3772c99e7eda0',
	'http://api.geonames.org/findNearbyWikipediaJSON?lat=' . $requestLat . '&lng=' . $requestLng . '&username=polishcomposer',
	'https://us1.locationiq.com/v1/reverse.php?key=pk.284d0ca5dc7bcb9d1b70803df62c8a1a&format=json&lat=' . $requestLat . '&lon=' . $requestLng,
	'https://vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com/api/news/get-coronavirus-news/1'];
	$info1 = [];
	for($i=0; $i<count($urls); $i++) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_URL,$urls[$i]);
	if($i==3) {
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com", $rapidApiKey]);	
	}
		$result=curl_exec($ch);
		curl_close($ch);
		$decode = json_decode($result,true);
		array_push($info1, $decode);
	}

$iso2 = $info1[0]['results'][0]['components']['ISO_3166-1_alpha-2'];
$iso3 = $info1[0]['results'][0]['components']['ISO_3166-1_alpha-3'];
if($iso2 == 'NY') { $iso2a='CY'; } else { $iso2a=$iso2; }

$urls2 = ['https://restcountries.eu/rest/v2/alpha/' . $iso3,
'https://corona-api.com/countries/' . $iso2a, 'https://calendarific.com/api/v2/holidays?&api_key=2adeac4fe82f4d26180b4fba95220aaae0cf7cc8&country=' . $iso2a . '&year=2021',
'https://travelbriefing.org/' . $iso2a . '?format=json',
'https://geohub3.p.rapidapi.com/cities/country/' . $iso2a . '?page=1&pageSize=2000&sort=desc&orderBy=population',
'https://airportix.p.rapidapi.com/airport/country_code/' . $iso2a . '/%7Bclassification%7D',
'https://api.openweathermap.org/data/2.5/onecall?lat=' . $info1[2]['lat'] . '&lon=' . $info1[2]['lon'] . '&exclude=minutely,hourly&units=metric&appid=d585e08b3b66222fc518c1729559ec1c'];
	$info2 = [];
	for($i2=0; $i2<count($urls2); $i2++) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_URL,$urls2[$i2]);
		if($i2==4) {
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
			curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: geohub3.p.rapidapi.com", $rapidApiKey]);
		} else if($i2==5) {
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
			curl_setopt($ch, CURLOPT_HTTPHEADER, ["x-rapidapi-host: airportix.p.rapidapi.com", $rapidApiKey]);	
		}
			$result=curl_exec($ch);
			curl_close($ch);
			$decode = json_decode($result,true);
			array_push($info2, $decode);
	}

	$border = file_get_contents('../js/countryBorders.geo.json');	
	$decodedBorders = json_decode($border, TRUE);
	foreach($decodedBorders['features'] as $key => $value  ) {
		if($value['properties']['iso_a2'] == $iso2) {
			$countryBorder = $value;
		}
	}
	$curLink = 'https://openexchangerates.org/api/currencies.json';
	$currencies = file_get_contents($curLink);	
	$decodedCurrencies = json_decode($currencies, TRUE);
	$countryName = $countryBorder['properties']['name'];
	$citiesIds = '';                 
	for($c=0; $c<20; $c++) {
	  if($c==19) {
		$citiesIds .= $info2[4]['data']['cities'][$c]['id'];
	  } else {
		$citiesIds .= $info2[4]['data']['cities'][$c]['id'] . ',';
	  }
	}
$urls3 = ['https://api.thenewsapi.com/v1/news/all?api_token=fQEQRdYwJLmUnc9tYo6OfVpj5axkUhemNSolOjE4&language=en&search=' . $countryName,
	'https://pixabay.com/api/?key=3853087-8c2a07a3d1d9a8e2ac4f750a3&q=' . $countryName . '+city&image_type=photo&per_page=3',
	'http://api.openweathermap.org/data/2.5/group?id=' . $citiesIds . '&units=metric&appid=d585e08b3b66222fc518c1729559ec1c'];
	$info3 = [];
		for($i3=0; $i3<count($urls3); $i3++) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_URL,$urls3[$i3]);
			$result=curl_exec($ch);
			curl_close($ch);
			$decode = json_decode($result,true);
			array_push($info3, $decode);
		}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

$output['data']['countryBorder'] = $countryBorder;
$output['data']['currencies'] = $decodedCurrencies;

$output['data']['location'] = $info1[0];
$output['data']['places'] = $info1[1];
$output['data']['covidNews'] = $info1[3];

$output['data']['population'] = $info2[0];
$output['data']['covidStats'] = $info2[1];
$output['data']['holidays'] = $info2[2];
$output['data']['travelInfo'] = $info2[3];
$output['data']['cities'] = $info2[4];
$output['data']['airports'] = $info2[5];
$output['data']['weather'] = $info2[6];

$output['data']['News'] = $info3[0];
$output['data']['countryImg'] = $info3[1];
$output['data']['citiesWeather'] = $info3[2];

if($_REQUEST['change']==1) {
$output['data']['capital'] = $decodeC;
}
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output); 

?>