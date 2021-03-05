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

$ch1 = curl_init();
$ch2 = curl_init();

        curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch1, CURLOPT_URL,'https://api.opencagedata.com/geocode/v1/json?q=' . $requestLat . '+' . $requestLng . '&language=en&key=498bd3e565df4d96bae3772c99e7eda0');

        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch2, CURLOPT_URL,'http://api.geonames.org/findNearbyWikipediaJSON?lat=' . $requestLat . '&lng=' . $requestLng . '&username=polishcomposer');
 
$mh = curl_multi_init();

curl_multi_add_handle($mh,$ch1);
curl_multi_add_handle($mh,$ch2);

do {
    $status = curl_multi_exec($mh, $active);
    if ($active) {
        curl_multi_select($mh);
    }
} while ($active && $status == CURLM_OK);

curl_multi_remove_handle($mh, $ch1);
curl_multi_remove_handle($mh, $ch2);

curl_multi_close($mh);
$location = json_decode(curl_multi_getcontent($ch1),true);
$places = json_decode(curl_multi_getcontent($ch2),true);

$iso2 = $location['results'][0]['components']['ISO_3166-1_alpha-2'];
$countryName = $location['results'][0]['components']['country'];

$ch5 = curl_init();
$ch6 = curl_init();
$ch7 = curl_init();
$ch9 = curl_init();
$ch10 = curl_init();
$ch11 = curl_init();
$ch12 = curl_init();
$ch13 = curl_init();
$ch14 = curl_init();

        curl_setopt($ch5, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch5, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch5, CURLOPT_URL,'https://restcountries.eu/rest/v2/alpha/' . $iso2);

		curl_setopt_array($ch6, [
			CURLOPT_URL => 'https://public-holiday.p.rapidapi.com/2021/'. $iso2,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_ENCODING => "",
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => "GET",
			CURLOPT_HTTPHEADER => [
				"x-rapidapi-host: public-holiday.p.rapidapi.com",
				"x-rapidapi-key: a2b8543599msh61f31ce8dd35036p1daae4jsn21bf23979fc2"
			],
		]);
        
		curl_setopt($ch7, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch7, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch7, CURLOPT_URL,'https://travelbriefing.org/' . $iso2 . '?format=json');

		curl_setopt($ch9, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch9, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch9, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch9, CURLOPT_HTTPHEADER, ["x-rapidapi-host: airportix.p.rapidapi.com", $rapidApiKey]);	
		curl_setopt($ch9, CURLOPT_URL,'https://airportix.p.rapidapi.com/airport/country_code/' . $iso2 . '/%7Bclassification%7D');
		
		curl_setopt($ch10, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch10, CURLOPT_RETURNTRANSFER, true);	
		curl_setopt($ch10, CURLOPT_URL,'https://api.openweathermap.org/data/2.5/onecall?lat=' . $requestLat . '&lon=' . $requestLng . '&exclude=minutely,hourly&units=metric&appid=d585e08b3b66222fc518c1729559ec1c');

		curl_setopt($ch11, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch11, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch11, CURLOPT_URL,'https://api.thenewsapi.com/v1/news/all?api_token=fQEQRdYwJLmUnc9tYo6OfVpj5axkUhemNSolOjE4&language=en&search=' . $countryName);

        curl_setopt($ch12, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch12, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch12, CURLOPT_URL,'https://pixabay.com/api/?key=3853087-8c2a07a3d1d9a8e2ac4f750a3&q=' . $countryName . '+city&image_type=photo&per_page=3');
        
		curl_setopt($ch13, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch13, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch13, CURLOPT_URL,'https://api.openweathermap.org/data/2.5/find?lat=' . $requestLat . '&lon=' . $requestLng . '&cnt=20&appid=d585e08b3b66222fc518c1729559ec1c');

		curl_setopt($ch14, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch14, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch14, CURLOPT_CUSTOMREQUEST, "GET");
		curl_setopt($ch14, CURLOPT_HTTPHEADER, ["x-rapidapi-host: covid-19-data.p.rapidapi.com", $rapidApiKey]);	
		curl_setopt($ch14, CURLOPT_URL,'https://covid-19-data.p.rapidapi.com/country/code?code=' . $iso2);

$mh2 = curl_multi_init();


curl_multi_add_handle($mh2,$ch5);
curl_multi_add_handle($mh2,$ch6);
curl_multi_add_handle($mh2,$ch7);
curl_multi_add_handle($mh2,$ch9);
curl_multi_add_handle($mh2,$ch10);
curl_multi_add_handle($mh2,$ch11);
curl_multi_add_handle($mh2,$ch12);
curl_multi_add_handle($mh2,$ch13);
curl_multi_add_handle($mh2,$ch14);
do {
    $status = curl_multi_exec($mh2, $active);
    if ($active) {
        curl_multi_select($mh2);
    }
} while ($active && $status == CURLM_OK);


curl_multi_remove_handle($mh2, $ch5);
curl_multi_remove_handle($mh2, $ch6);
curl_multi_remove_handle($mh2, $ch7);
curl_multi_remove_handle($mh2, $ch9);
curl_multi_remove_handle($mh2, $ch10);
curl_multi_remove_handle($mh2, $ch11);
curl_multi_remove_handle($mh2, $ch12);
curl_multi_remove_handle($mh2, $ch13);
curl_multi_remove_handle($mh2, $ch14);
curl_multi_close($mh2);

$population = json_decode(curl_multi_getcontent($ch5),true);
$holidays = json_decode(curl_multi_getcontent($ch6),true);
$travelInfo = json_decode(curl_multi_getcontent($ch7),true);
$airports = json_decode(curl_multi_getcontent($ch9),true);
$weather = json_decode(curl_multi_getcontent($ch10),true);
$news = json_decode(curl_multi_getcontent($ch11),true);
$countryImg = json_decode(curl_multi_getcontent($ch12),true);
$citiesWeather = json_decode(curl_multi_getcontent($ch13),true);
$covidStats = json_decode(curl_multi_getcontent($ch14),true);

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

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

$output['data']['countryBorder'] = $countryBorder;
$output['data']['currencies'] = $decodedCurrencies;
$output['data']['location'] = $location;
$output['data']['places'] = $places;
$output['data']['population'] = $population;
$output['data']['holidays'] = $holidays;
$output['data']['travelInfo'] = $travelInfo;
$output['data']['airports'] = $airports;
$output['data']['weather'] = $weather;
$output['data']['News'] = $news;
$output['data']['countryImg'] = $countryImg;
$output['data']['citiesWeather'] = $citiesWeather;
$output['data']['covidStats'] = $covidStats;
if($_REQUEST['change']==1) {
$output['data']['capital'] = $decodeC;
}
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output); 

?>