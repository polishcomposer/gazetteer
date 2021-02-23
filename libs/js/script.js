$(window).on('load', function () {
  if ($('#preloader').length) {
  $('#preloader').delay(2000).fadeOut('slow', function () {
  $(this).remove();
  });
  } 
  });
let userLat, userLong, viewCapital;
navigator.geolocation.getCurrentPosition(function success(position) {
userLat = position.coords.latitude; 
userLong = position.coords.longitude;

if(window.location.href.includes('lat') && window.location.href.includes('lng')) {
  userLat = window.location.href.slice(window.location.href.indexOf('lat')+4, window.location.href.indexOf('lng')-1);
  userLong = window.location.href.slice(window.location.href.indexOf('lng')+4, window.location.href.indexOf('capital')-1);
  if(window.location.href.includes("@")) {
    viewCapital = window.location.href.slice(window.location.href.indexOf('capital')+8).replaceAll("@", "'");
  } else {
    viewCapital = window.location.href.slice(window.location.href.indexOf('capital')+8).replaceAll("_", " ");
  }
 
}
		$.ajax({
			url: "libs/php/getInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				lat: userLat,
        lng: userLong,
        request: 1
			},
      
			success: function(result) {
				if (result.status.name == "ok") {
/*--------------------- CURRENCY SECTION ---------------------*/  
        $.ajax({
          url: "libs/php/getInfo.php",
          type: 'POST',
          dataType: 'json',
          data: {
            request: 17
          },
          success: function(curs) {
            if (result.status.name == "ok") {
            $('.pre_currency_box').hide();
            $('#currencyInfo').show();
            let currencyInfo = result['data']['results'][0]['annotations']['currency'];
            let selectCurrency = '<select id="selectC">';
            selectCurrency += '<option value="" disabled selected>Choose currency</option>';
            for (const [key, value] of Object.entries(curs['data'])) {
              selectCurrency += `<option value="${key}">${value}</option>`;
            }
            selectCurrency += '</select>';
            $('#currencyData').html(`<span class="currencyE">Name: </span><b>${currencyInfo['name']} (${currencyInfo['iso_code']})</b><br>
            <span class="currencyE">Symbol: </span><b>${currencyInfo['symbol']}</b><br>
            <span class="currencyE">Subunit: </span><b>${currencyInfo['subunit']}</b><br>
            <div id="curBox"><div id="convertCurrency"><b>Exchange rate:</b><br><div id="calculation">1 ${currencyInfo['iso_code']} = <span id="exResult">?</span></div><br>${selectCurrency}</div><div>`);
            $('#selectC').change(function() {
              let chosenCur = $(this).val();
              $.ajax({
                url: "libs/php/getInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                  base: currencyInfo['iso_code'],
                  symbol: chosenCur,
                  request: 18
                },
                success: function(chosenC) {
                  if (result.status.name == "ok") {
                   $('#exResult').html(`${chosenC['data']['conversion_rate']} ${chosenCur}`);
                  }}});
              
            });
         
        }}});
        

          if(!window.location.href.includes('capital') && !window.location.href.includes('lng')) {
            $.ajax({
              url: "libs/php/getInfo.php",
              type: 'POST',
              dataType: 'json',
              data: {
                col: result['data']['results'][0]['components']['ISO_3166-1_alpha-3'],
                request: 2
              },
              success: function(userCapital) {
                if (result.status.name == "ok") {
                $('#capitalAnswer').html(userCapital.data[1][0]['capitalCity']);
              }
            }
            });
          }
          let countryCode = "";
          let infoUrlCountry = window.location.href.slice(window.location.href.indexOf('country')+8, window.location.href.indexOf('lat')-1);
       
          if(window.location.href.includes('country')) {
              countryCode = infoUrlCountry.replaceAll("_", " ");
          } else {
            countryCode = result['data']['results'][0]['components']['ISO_3166-1_alpha-3'];
          }
          
            let flag, countryWithFlag, countryInfoFlag;
            switch(viewCapital) {
              case 'N. Cyprus':
                flag='NY';
                countryWithFlag = 'N. Cyprus';
                countryInfoFlag = 'CYP';
                $('#userLocationWithFlag').html(`<span class="answer">Not recognized as a country. Part of Cyprus.</span><br>`);
              break;
              case 'Somaliland':
                countryWithFlag = 'Somaliland';
                countryInfoFlag = 'SOM';
                flag='SO';
                $('#userLocationWithFlag').html(`<span class="answer">Not recognized as a country. Part of Somalia.</span><br>`);
              break;
              case 'Kosovo':
                flag='RS';
                countryWithFlag = 'Kosovo';
                countryInfoFlag = 'SRB';
                $('#userLocationWithFlag').html(`<span class="answer">Not recognized as a country. Part of Serbia.</span><br>`);
              break;
              default:
                flag = result['data']['results'][0]['components']['ISO_3166-1_alpha-2'];
                countryInfoFlag = result['data']['results'][0]['components']['ISO_3166-1_alpha-3'];
                if(result['data']['results'][0]['components']['region']) {
                  countryWithFlag = result['data']['results'][0]['components']['region'];
                } else {
                  countryWithFlag = result['data']['results'][0]['components']['country'];
                }
                if(!window.location.href.includes('country') || window.location.href.includes('capital')) {
                  $('#capitalAnswer').html(viewCapital);
                  } 
              break;
            }
            if(viewCapital == 'Laayoune') {
              $('#userLocationWithFlag').html(`<span class="answer">Western Sahara is occupied and administered by Morocco.</span><br>`);
            }
            $.ajax({
              url: "libs/php/getInfo.php",
              type: 'POST',
              dataType: 'json',
              data: {
                countryName: countryWithFlag,
                request: 9
              },
              success: function(countryPhoto) {
                let photo;
                if(countryPhoto['data']['total']<2) {
                  photo = 'libs/img/journey.jpg';
                } else {
                  photo = countryPhoto['data']['hits'][1]['webformatURL'];
                }
                $('#countryPhoto').html(`<img src="${photo}" alt="flag" id="countryPhotoId" >`);
              }});

/*--------------------- NEWS SECTION ---------------------*/
              $.ajax({
                url: "libs/php/getInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                  countryName: countryWithFlag,
                  request: 16
                },
                success: function(news) {
                  if (result.status.name == "ok") {
                  let getNews = news['data']['data'];
                  $('#countryNews').html(`<img src="libs/img/news.png" alt="news"><b>${getNews[0]['title']}</b><br><a href="${getNews[0]['url']}">${getNews[0]['snippet']}</a>`);

                
                  let newsList = '<dl>';
                  for(let nA = 0; nA<getNews.length; nA++) {
                    newsList += `<dt>${getNews[nA]['title']}</dt><dd><img src="libs/img/news.png" alt="news"><a href="${getNews[nA]['url']}" target="_blank">${getNews[nA]['snippet']}</a></dd>`;
                        }
                        newsList += '</dl>';
                  $('#allNews').html(newsList);
                 
                console.log(news);
                    $('.pre_news_box').hide();
                    $('#News').show();
                }}, error: function() {
                  $('#countryNews').html('No news available.');
                }});
              
/*--------------------- INFORMATION SECTION ---------------------*/
              $.ajax({
                url: "libs/php/getInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                  ab: flag,
                  request: 7
                },
                success: function(infoX) {
                  if (result.status.name == "ok") {
                  let emergencyText = '<b>Emergency numbers:</b><br>';
               for (const [key, value] of Object.entries(infoX['data']['telephone'])) {
                emergencyText += `<span class="weatherE">${key}: </span><b>${value}</b><br>`;
               }
               $('#emergency').html(emergencyText);
               let neighbours = '<span class="weatherE">Neighbours: </span>';
               for(let x = 0; x <infoX['data']['neighbors'].length; x++) {
                 if(x == infoX['data']['neighbors'].length-1) {
                  neighbours += `<b>${infoX['data']['neighbors'][x]['name']}</b>`;
                 } else {
                  neighbours += `<b>${infoX['data']['neighbors'][x]['name']}, </b>`;
                 }
               }
               $('#neighbours').html(neighbours);
               $('#advise').html(`<br><span class="weatherE">Travel Advise: </span><b>${infoX['data']['advise']['CA']['advise']}, ${infoX['data']['advise']['UA']['advise']}</b>`);
/*--------------------- PLACES INFO ---------------------*/  
               $.ajax({
                url: "libs/php/getInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                  lat: userLat,
                  lng: userLong,
                  request: 15
                },
                success: function(placesX) {
                  if (result.status.name == "ok") {
                  let placesList = '<dl>';
                  for(let plA = 0; plA<placesX['data']['geonames'].length; plA++) {
                    placesList += `<dt>${placesX['data']['geonames'][plA]['title']}</dt><dd><a href="${placesX['data']['geonames'][plA]['wikipediaUrl']}" target="_blank">${placesX['data']['geonames'][plA]['summary']}</a></dd>`;
                        }
                        placesList += '</dl>';
                  $('#places').html(placesList);
               
  
/*--------------------- HOLIDAYS ---------------------*/  
                  $.ajax({
                    url: "libs/php/getInfo.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      ab: flag,
                      request: 8
                    },
                    success: function(holidays) {
                      if (result.status.name == "ok") {
                      $('.pre_information_box').hide();
                      $('#showInfoC').show();
                      let holidaysList = `<select id="selectHolidays" class="countriesList">
                      <option value="" disabled selected>Holidays</option>`;
                  for(let h = 0; h<holidays['data']['response']['holidays'].length; h++) {
                    holidaysList += `<option value="${h}">${holidays['data']['response']['holidays'][h]['name']}</option>`;
                        }
                        holidaysList += '</select>';
                  $('#selectHoliday').html(holidaysList);
                  $('#selectHolidays').change(function() {
                    let chosenHoliday = holidays['data']['response']['holidays'][$(this).val()];
                    $('#holidayName').html(chosenHoliday['name']);
                    $('#holidayDescription').html(`<span class="weatherE">Date: </span><b>${chosenHoliday['date']['iso']}</b><br>${chosenHoliday['description']}`);
                    $('#holidayModal').modal('show');
                  });
                }}});
             }}});
        }}});
/*--------------------- COVID-19 SECTION ---------------------*/               
              $('.covidHeader').html(`<img src="libs/img/covid.png" alt="covid" title="COVID-19"><h2>COVID-19</h2>`);
              $.ajax({
                url: "libs/php/getInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                  ab: flag,
                  request: 13
                },
                success: function(covidInfo) {
                  if (result.status.name == "ok") {
                  console.log(covidInfo);
                  $('.pre_covid_box').hide();
                  $('#covidB').show();
                 function spreadN(s) {
                   if(s>0) {
                      const string = s.toString();
                      const reverse = string.split("").reverse().join("");
                      const match = reverse.match(new RegExp('.{1,3}', 'g'));
                      const join = match.join(' ');
                      return join.split("").reverse().join("");
                    } else {
                      return '0';
                    }
                  }
                  const covidData = covidInfo['data']['data'];
                  const confirmed = covidData['latest_data']['confirmed'];
                  const critical = covidData['timeline'][0]['active'];
                  const deaths = covidData['latest_data']['deaths'];
                  const recovered = covidData['latest_data']['recovered'];
                  const newConfirmed = covidData['today']['confirmed'];
                  const newDeaths = covidData['today']['deaths'];
                  let deathRate;
                  if(covidData['latest_data']['calculated']['death_rate']){
                    deathRate = covidData['latest_data']['calculated']['death_rate'].toString();
                  } else {
                    deathRate = '0';
                  }
                
                  const casesMln = covidData['latest_data']['calculated']['cases_per_million_population'];
                  let showConfirmed, showDeaths, covidChange;
                  if(newConfirmed==0) {
                    showConfirmed = '';
                    covidChange = '';
                  } else {
                    covidChange = "class=\"covidChange\"";
                    showConfirmed =  '+' + spreadN(newConfirmed);
                  }
                  if(newDeaths==0) {
                    showDeaths = '';
                    covidChange = '';
                  } else {
                    covidChange = "class=\"covidChange\"";
                    showDeaths =  '+' + spreadN(newDeaths);
                  }
                  $('.covidCountry').html(`<span class="covidE">Confirmed: </span><b>${spreadN(confirmed)}</b> <span ${covidChange}>${showConfirmed}</span><br>
                  <span class="covidE">Active: </span><b>${spreadN(critical)}</b><br>
                  <span class="covidE">Recovered: </span><span id="recovered">${spreadN(recovered)}</span><br>
                  <span class="covidE">Deaths: </span><span id="dead">${spreadN(deaths)}</span> <span ${covidChange}>${showDeaths}</span><br>
                  <span class="covidE">Death rate: </span><b>${deathRate.substr(0,4)}</b><br>
                  <span class="covidE">Cases / mln: </span><b>${spreadN(casesMln)}</b>`);

                  $('.covidCountry2').html(`<div id="covidLeftB"><span class="covidE">Confirmed: </span><b>${spreadN(confirmed)}</b> <span ${covidChange}>${showConfirmed}</span><br>
                  <span class="covidE">Active: </span><b>${spreadN(critical)}</b><br>
                  <span class="covidE">Recovered: </span><span id="recovered">${spreadN(recovered)}</span></div>
                  <div id="covidRightB"><span class="covidE">Deaths: </span><span id="dead">${spreadN(deaths)}</span> <span ${covidChange}>${showConfirmed}</span><br>
                  <span class="covidE">Death rate: </span><b>${deathRate.substr(0,4)}</b><br>
                  <span class="covidE">Cases / mln: </span><b>${spreadN(casesMln)}</b></div>`);
              
                }}, error: function() {
                  $('.pre_covid_box').hide();
                  $('#covidCountry').html(`Information about this country is not available.`);
                }});

                
/*--------------------- POPULATION INFO ---------------------*/  
            $.ajax({
              url: "libs/php/getInfo.php",
              type: 'POST',
              dataType: 'json',
              data: {
                col: countryInfoFlag,
                request: 4
              },
              success: function(population) {
                if (result.status.name == "ok") {
                $('#regionAnswer').html(population.data['region']);
                $('.pre_population_box').hide();
                $('#countryInfo').show();

                if (result.status.name == "ok") {
                  let getPopulation;
             if(population.data['population'].length <= 3) {
              getPopulation = population.data['population'];
             } else {
              function reverseString(s) {
                return s.split("").reverse().join("");
              }
              let firstPop = population.data['population'].toString();
              let secondPop = reverseString(firstPop).match(new RegExp('.{1,3}', 'g'));
              getPopulation = reverseString(secondPop.join(','));
             }

             let langA, languagesA = '';
             if(population.data['languages'].length > 1) {
              langA = 'Languages';
              for(let a = 0; a < population.data['languages'].length; a++) {
                if(a==population.data['languages'].length-1) {
                languagesA += population.data['languages'][a]['name'];
                } else {
                languagesA += population.data['languages'][a]['name'] + ', ';
              }
              }
             } else {
              langA = 'Language';
              languagesA = population.data['languages'][0]['name'];
             }
              $('#languagesAnswer').html(`<span class="what">${langA}: </span><span class="answer" >${languagesA}</span><br>`);
              $('#populationAnswer').html(getPopulation);
              }
            }}
            });
           
            $('#countryHeader').html(`<img src="https://www.countryflags.io/${flag}/shiny/64.png"><h2>${countryWithFlag}</h2>`);
            if(!window.location.href.includes('capital') && !window.location.href.includes('lng')) {
              $('#userLocationWithFlag').html(`<span class="what">Your location:</span><span class="answer" > ${result['data']['results'][0]['formatted']}</span><br>`); 
            }
            $('#timezoneAnswer').html(result['data']['results'][0]['annotations']['timezone']['name']);
/*--------------------- COUNTRIES ---------------------*/            
                    $.ajax({
                      url: "libs/php/getInfo.php",
                      type: 'POST',
                      dataType: 'json',
                      data: {
                        request: 3
                      }, success: function(resultAsCountry) {
                        if (result.status.name == "ok") {
                        let result2 = resultAsCountry['data'];
                        let countries = '<select class="countriesList">';
                        let countriesArray = [];
                        jQuery.each(result2.features, function(a) {
                          if(viewCapital == 'Laayoune' && result2.features[a]['properties']['iso_a3'] == 'ESH') {
                            countriesArray.push(`<!-- ${result2.features[a]['properties']['name']} --> <option value='ESH' selected>${result2.features[a]['properties']['name']}</option>`);
                          } else if(countryCode == result2.features[a]['properties']['iso_a3'] || countryCode == result2.features[a]['properties']['name']) {
                         
                            if(window.location.href.includes('country')) {
                              
                            } else if(viewCapital == 'Laayoune') {
                              countriesArray.push(`<!-- ${result2.features[a]['properties']['name']} --> <option value='${countryCode}' selected>${result2.features[a]['properties']['name']}</option>`);
                            } else {
                              countriesArray.push(`<!-- ${result2.features[a]['properties']['name']} --> <option value='${result2.features[a]['properties']['iso_a3']}' selected>${result2.features[a]['properties']['name']}</option>`);
                            }
                            
                            let countryBorders = L.geoJSON(result2.features[a], 
                             { style: {
                                  "color": "gold",
                                  "weight": 3,
                                  "opacity": 0.85}
                                  }).addTo(map);
                            map.fitBounds(countryBorders.getBounds());
                            let homeIcon = L.icon({
                              iconUrl: 'libs/img/homeMarker.png',
                              iconSize:     [40, 40],
                              iconAnchor:   [20, 40],
                              popupAnchor:  [1, -40]
                            });
                
                            let marker = L.marker([userLat, userLong], {icon: homeIcon}).addTo(map);
                            let markerText = `You are here: <b>${result['data']['results'][0]['formatted']}</b>`;
                            if(viewCapital == 'N. Cyprus (Cuprus)' || viewCapital == 'Somaliland (Somalia)' || viewCapital == 'Kosovo (Serbia)') {
                            markerText = `<b>${viewCapital}</b><br>(Not recognized as a country.)`; 
                            } else if(window.location.href.includes('capital')) {
                              markerText = `<b>${viewCapital}</b><br>Capital City`;
                            } 
                            marker.bindPopup(markerText).openPopup();
/*--------------------- CITIES ---------------------*/                            
                            $.ajax({
                              url: "libs/php/getInfo.php",
                              type: 'POST',
                              dataType: 'json',
                              data: {
                                ab: flag,
                                request: 5
                              },
                              success: function(cities) {
                                if (result.status.name == "ok") {
                                $('.pre_cities_box').hide();
                                $('#pre_cities_ok').show();
                                let markers = L.markerClusterGroup();
                                if (result.status.name == "ok") {

                                  let checkCitiesLayer, btnCities;
                                  let allCities = cities['data']['data']['cities'];  
                                  let weatherCities = [];
                                  for(let ci= 0; ci<allCities.length; ci++) {
                                    markers.addLayer(L.marker([allCities[ci]['latitude'], allCities[ci]['longitude']]).bindPopup(allCities[ci]['name']));
                                    if(allCities.length>19) {
                                      if(ci<19) {
                                        weatherCities.push(allCities[ci]);
                                      }
                                    } else {
                                      weatherCities.push(allCities[ci]);
                                    }
                                  }

                              let homeButton = L.easyButton('<img src="libs/img/home.png" alt="home" title="Home Location" id="homeImg">', function (btn) {
                                    let btnMarker = btn;
                                    if(marker) {
                                      map.removeLayer(marker);
                                      btnMarker.button.style.backgroundColor = null;
                                      marker = null;
                                    } else {
                                      btnMarker.button.style.backgroundColor = 'gold';
                                      marker = L.marker([userLat, userLong], {icon: homeIcon}).bindPopup(markerText).addTo(map);
                                    }
                                  }).addTo(map);
                                  homeButton.button.style.backgroundColor = 'gold';
                                  let bordersButton = L.easyButton(`<img src="https://www.countryflags.io/${flag}/shiny/64.png" alt="info" title="Country Info" id="flagImg">`, function (btn) {
                                    let btnBorders= btn;
                                  if(countryBorders) {
                                      map.removeLayer(countryBorders);
                                      btnBorders.button.style.backgroundColor = null;
                                      countryBorders = null;
                                    } else {
                                      btnBorders.button.style.backgroundColor = 'gold';
                                      countryBorders = L.geoJSON(result2.features[a], 
                                        { style: {
                                             "color": "gold",
                                             "weight": 3,
                                             "opacity": 0.85}
                                             }).addTo(map);
                                    }
                                  }).addTo(map); 
                                  bordersButton.button.style.backgroundColor = 'gold';
                                   $('#cities').on('click', () => {
                                     $('#info').slideToggle();
                                     $('#infoTop').fadeToggle();
                                     $('#cloak').fadeToggle();
                                     $('#scrollDown').toggle();
                                     checkCitiesLayer =  map.addLayer(markers);
                                     citiesEasyButoon.button.style.backgroundColor = 'gold';
                                   });
                               let citiesEasyButoon = L.easyButton('<img src="libs/img/city.png" alt="cities" title="Biggest Cities" id="cityImg">',  function (btn){
                                     btnCities = btn;
                                   if(checkCitiesLayer) {
                                     map.removeLayer(markers);
                                     checkCitiesLayer = null;
                                     btnCities.button.style.backgroundColor = null;
                                   } else {
                                     checkCitiesLayer = map.addLayer(markers);
                                     btnCities.button.style.backgroundColor = 'gold';
                                   }
                                   }).addTo(map);
/*--------------------- AIRPORTS SECTION ---------------------*/
                                   $.ajax({
                                    url: "libs/php/getInfo.php",
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                      ab: flag,
                                      request: 6
                                    },
                                    success: function(airports) {
                                      if (result.status.name == "ok") {
                                      $('.pre_airports_box').hide();
                                      $('#pre_airports_ok').show();
                                      if (result.status.name == "ok") {
                                        let checkAirportsLayer; 
                                  let allAirports = airports['data']['data'];  
                                   let airportsMarkers = [];
                                   let airportIcon = L.icon({
                                    iconUrl: 'libs/img/airportMarker.png',
                                    iconSize:     [40, 40],
                                    iconAnchor:   [20, 40],
                                    popupAnchor:  [1, -40]
                                  });
                                   for(let ai= 0; ai<allAirports.length; ai++) {
                                     airportsMarkers.push(L.marker([allAirports[ai]['location']['latitude'], allAirports[ai]['location']['longitude']], {icon: airportIcon}).bindPopup(allAirports[ai]['name']['original']));
                                    } 
                                   let airportsLayer = L.layerGroup(airportsMarkers);
                                   $('#airports').on('click', () => {
                                    $('#info').slideToggle();
                                    $('#infoTop').fadeToggle();
                                    $('#cloak').fadeToggle();
                                    $('#scrollDown').toggle();
                                    checkAirportsLayer = airportsLayer.addTo(map);
                                    airportsEasyButoon.button.style.backgroundColor = 'gold';
                                  });
                                   let airportsEasyButoon = L.easyButton(`<img src="libs/img/airports.png" alt="airports" title="Country Info" id="airportsImg">`, function (btn) {
                                    let btnAirports = btn;
                                    if(checkAirportsLayer) {
                                      map.removeLayer(airportsLayer);
                                      checkAirportsLayer = null;
                                      btnAirports.button.style.backgroundColor = null;
                                    } else {
                                      checkAirportsLayer = airportsLayer.addTo(map);
                                      btnAirports.button.style.backgroundColor = 'gold';
                                    }
                                  }).addTo(map); 

                                  $.ajax({
                                    url: "libs/php/getInfo.php",
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                      lat: userLat,
                                      lng: userLong,
                                      request: 12
                                    },
                                    success: function(myLocation) {
                                  
/*--------------------- WEATHER SECTION ---------------------*/                    
                                $.ajax({
                                    url: "libs/php/getInfo.php",
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                      lat: myLocation['data']['boundingbox'][0],
                                      lng: myLocation['data']['boundingbox'][2],
                                      request: 11
                                    },
                                    success: function(wheaterLocation) {
                                      if (result.status.name == "ok") {
                                      $('.pre_weather_box').hide();
                                      let currentW = wheaterLocation['data']['current'];
                                      let dateNow = new Date();
                                      let myDate = dateNow.toDateString();
                                      let myTime = dateNow.toLocaleTimeString();
                                      let sunrise = new Date(currentW['sunrise']);
                                      let sunriseTime = sunrise.toLocaleTimeString();
                                      let sunset = new Date(currentW['sunset']);
                                      let sunsetTime = sunset.toLocaleTimeString();
                                      let timeLong;
                                      if(myTime.length==10) {
                                        timeLong = 4;
                                      } else {
                                        timeLong = 5;
                                      }
                                      $('#weatherToday').html(`<div id="todayWLeft"><h2>Weather</h2><span id="todayD">${myTime.substr(0,timeLong)}${myTime.substr(-2,2).toLowerCase()}, ${myDate.substr(4,6)}</span><div id="todayDown"><img src="http://openweathermap.org/img/w/${currentW['weather'][0]['icon']}.png" id="todayWeatherImg" alt="Weather Today">
                                      <span id="todayWeatherTemp">${Math.round(currentW['temp'])}<sup>o</sup>C</span><br>
                                      <span id="todayWeatherDesc">${currentW['weather'][0]['description']}</div></div>
                                      <div id="todayWRight"><span class="weatherE">Feels like: </span><b>${Math.round(currentW['feels_like'])}<sup>o</sup>C</b><br><span class="weatherE">Humidity: </span><b>${currentW['humidity']}%</b><br>
                                      <span class="weatherE">Pressure: </span><b>${currentW['pressure']} hPa</b><br><span class="weatherE">Visibility: </span><b>${currentW['visibility']/1000} km</b><br><span class="weatherE">Wind: </span><b>${currentW['wind_speed']} m/s</b> <img src="libs/img/weather/arrow.png" style="transform: rotate(${currentW['wind_deg']+180}deg)" alt="wind"></div>
                                     <div id="SunriseInfo"> <img src="libs/img/weather/sunrise.png" alt="sunrise" id="sunriseImg"> <b>Sunrise ${sunriseTime.substring(0,sunriseTime.length-6)}am</b> Sunset ${sunsetTime.substring(0,sunsetTime.length-6)}pm</div></span></div>`);
                                     let newDay, forecast, forecastDate;
                                     let forecastDays = '';
                                     for(let dF=1; dF<6; dF++) {
                                      newDay = wheaterLocation['data']['daily'][dF];
                                      forecastDate = new Date(dateNow.setDate(dateNow.getDate() +1));
                                      forecast = forecastDate.toDateString();
                                      forecastDays += `<div id="forecastBox"><sub>${forecast.substr(0,3)},</sub>${forecast.substr(4,6)}<br>
                                      <img src="http://openweathermap.org/img/w/${newDay['weather'][0]['icon']}.png" id="imgF" alt="Weather on ${forecast}"><br>
                                      ${Math.round(newDay['temp']['max'])} / ${Math.round(newDay['temp']['min'])}<sup>o</sup>C
                                      </div>`;
                                    }
                                    $('#weatherBoxes').html(forecastDays);
                                    }}}); 


                                    let citiesIds = '';
                                 
                                  for(let wCit = 0; wCit<weatherCities.length; wCit++) {
                                    if(wCit==weatherCities.length-1) {
                                      citiesIds += weatherCities[wCit]['id'];
                                    } else {
                                      citiesIds += weatherCities[wCit]['id'] + ',';
                                    }
                                  }
                            
                                $.ajax({
                                    url: "libs/php/getInfo.php",
                                    type: 'POST',
                                    dataType: 'json',
                                    data: {
                                      cities: citiesIds,
                                      request: 10
                                    },
                                    success: function(weather) {
                                      if (result.status.name == "ok") {
                                    let allWeather = weather['data']['list'];  
                                    let weatherMarkers = [];
                                    let weatherIcon; 
                                    let weatherIconInfo = '';
                                  for(let we=0; we<allWeather.length; we++) {
                                    weatherIcon = L.icon({
                                      iconUrl: "http://openweathermap.org/img/w/" + allWeather[we]['weather'][0]['icon'] + ".png",
                                      iconSize:     [40, 40],
                                      iconAnchor:   [10, 20],
                                      popupAnchor:  [1, -40]
                                    });
                                    weatherIconInfo = `<b><span class="weatherIconTitle">${allWeather[we]['weather'][0]['description']}</span></b><br>Temperature: <b>${allWeather[we]['main']['temp']}<sup>o</sup>C</b><br>Humidity: <b>${allWeather[we]['main']['humidity']}%</b><br>
                                                        Pressure: <b>${allWeather[we]['main']['pressure']} mb</b><br>Wind: <b>${allWeather[we]['wind']['speed']} mph</b><br>`;
                                    weatherMarkers.push(L.marker([allWeather[we]['coord']['lat'], allWeather[we]['coord']['lon']], {icon: weatherIcon}).bindPopup(weatherIconInfo));
                                  }
                                    
                                 let checkWeatherLayer;
                                  let weatherLayer = L.layerGroup(weatherMarkers);
                                 let weatherButton =  L.easyButton(`<img src="libs/img/weather.png" alt="weather" title="Weather info" id="weatherImg">`, function (btn) {
                                    let btnWeather = btn;
                                    if(checkWeatherLayer) {
                                      map.removeLayer(weatherLayer);
                                      checkWeatherLayer = null;
                                      btnWeather.button.style.backgroundColor = null;
                                    } else {
                                      checkWeatherLayer = weatherLayer.addTo(map);
                                      btnWeather.button.style.backgroundColor = 'gold';
                                    }
                                  }).addTo(map);      
                                

                                  L.easyButton('<img src="libs/img/covid.png" alt="covid" title="COVID-19" id="covidImg">',  function (){
                                    $('#covidModal').modal('show');
                                  }).addTo(map);

                                  L.easyButton(`<img src="libs/img/rubber.png" alt="rubber" title="Clean the map" id="rubberImg">`, function () {
                                      weatherButton.button.style.backgroundColor = null;
                                      airportsEasyButoon.button.style.backgroundColor = null;
                                      citiesEasyButoon.button.style.backgroundColor = null; 
                                      homeButton.button.style.backgroundColor = null;
                                      bordersButton.button.style.backgroundColor = null;
                                      if(weatherLayer) {
                                        weatherLayer.remove();
                                        checkWeatherLayer = null;
                                      }
                                      if(checkAirportsLayer) {
                                        airportsLayer.remove();
                                        checkAirportsLayer = null;
                                      }
                                      if(checkCitiesLayer) {
                                        map.removeLayer(markers);
                                        checkCitiesLayer = null;
                                      }
                                      if(countryBorders) {
                                        countryBorders.remove();
                                        countryBorders = null;
                                      }
                                      if(marker) {
                                        marker.remove();
                                        marker = null;
                                      }
                                      
                                  }).addTo(map); 

                                }}, error: function(jqXHR, textStatus, errorThrown) {
                                  console.log((jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown));
                                }
                              });
                            }});
                                   }}}, error: function(jqXHR, textStatus, errorThrown) {
                                    console.log((jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown));
                                  }});
                              }}}
                              });
                                  
                            L.control.scale().addTo(map);
                          } else {
                            let checkName = result2.features[a]['properties']['name'];
                            if(checkName == 'N. Cyprus' || checkName == 'Somaliland' || checkName == 'Kosovo') {
                              countriesArray.push(`<!-- ${result2.features[a]['properties']['name']} --><option value='${checkName}'>${result2.features[a]['properties']['name']}</option>`);
                            } else {
                              countriesArray.push(`<!-- ${result2.features[a]['properties']['name']} --><option value='${result2.features[a]['properties']['iso_a3']}'>${result2.features[a]['properties']['name']}</option>`);
                          }
                        }
                        });

                       let sortedCountries = countriesArray.sort();
                     for(let a in sortedCountries) {
                        countries += sortedCountries[a];
                      }
                       
                        countries += "</select>";
                        document.getElementById('selectCountry').innerHTML = countries;
                        document.getElementById('infoSelectCountry').innerHTML = countries;
                        $('.countriesList').change(function() {
                          if($(this).val() == 'N. Cyprus' || $(this).val() == 'Somaliland' || $(this).val() == 'Kosovo') {
                            let latCodeB = 0,  lngCodeB = 0, notCountry = '';
                            switch($(this).val()) {
                              case 'N. Cyprus':
                                latCodeB = 35.185566;
                                lngCodeB = 33.382275;
                                notCountry = 'N._Cyprus';
                              break;
                              case 'Somaliland':
                                latCodeB = 9.411743;
                                lngCodeB = 46.825284;
                                notCountry = 'Somaliland';
                              break;
                              case 'Kosovo':
                              	latCodeB = 42.5869578;
                                lngCodeB = 20.9021231;
                                notCountry = 'Kosovo';
                              break;
                              case 'Kosovo':
                              	latCodeB = 42.5869578;
                                lngCodeB = 20.9021231;
                                notCountry = 'Kosovo';
                              break;
                            }
                            window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + '?country=' + notCountry + '&lat=' + latCodeB + '&lng=' + lngCodeB + '&capital=' + notCountry;
                          
                          } else if($(this).val() == 'TWN') {
                            window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + '?&lat=25.105497&lng=121.597366&capital=Taipei';
                          } else if($(this).val() == 'ESH') {
                            window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + '?&lat=27.152810935039838&lng=-13.199320900136762&capital=Laayoune';
                          } else {
                              const countryC = $(this).val();
                        	$.ajax({
                            url: "libs/php/getInfo.php",
                            type: 'POST',
                            dataType: 'json',
                            data: {
                              col: countryC,
                              request: 2
                            },
                            success: function(capital) {
                              if (result.status.name == "ok") {
                                let getCapitalCity = '';
                                if(capital.data[1][0]['capitalCity'].includes("'")) {
                                  getCapitalCity = capital.data[1][0]['capitalCity'].replaceAll("'", "@");
                                } else {
                                  getCapitalCity = capital.data[1][0]['capitalCity'].replaceAll(" ", "_");
                                }
                                const latCode = capital.data[1][0]['latitude'];
                                const lngCode = capital.data[1][0]['longitude'];
                                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + '?&lat=' + latCode + '&lng=' + lngCode + '&capital=' + getCapitalCity;
                              } else {
                                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + '?country=' + countryCode + '&capital=' + getCapitalCity;
                              }
                              
                            }
                            });
                          }
                        });
                      }}, error: function(jqXHR, textStatus, errorThrown) {
                        console.log((jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown));
                      }
                    });    
				} 
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$('#countryInfo').html(jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown);
			}
		}); 

    
    $.ajax({
      url: "libs/php/getInfo.php",
      type: 'POST',
      dataType: 'json',
      data: {
        request: 14
      },
      success: function(covidInfo) {
      let covidNewsList = '';
for(let covA = 0; covA<covidInfo['data']['news'].length; covA++) {
  covidNewsList += `<dt>${covidInfo['data']['news'][covA]['reference'].toUpperCase()}</dt><dd><a href="${covidInfo['data']['news'][covA]['link']}" target="_blank">${covidInfo['data']['news'][covA]['title']}</a></dd>`;
      }
      $('.covidArticles').html(covidNewsList);
    }});


    var map = L.map('map');
    const streetsView = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);
    const imageryView = L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    const topoView = L.tileLayer.provider('OpenTopoMap').addTo(map);
    const darkView = L.tileLayer.provider('Stadia.AlidadeSmoothDark').addTo(map);
    const baseMaps = {
      "<img src='libs/img/darkView.png' style='width:70%;'>": darkView,      
      "<img src='libs/img/topoView.png' style='width:70%;'>": topoView,
      "<img src='libs/img/imageryView.png' style='width:70%;'>": imageryView,
      "<img src='libs/img/streetsView.png' style='width:70%;'>": streetsView
  };
    L.control.layers(baseMaps, null, {position: 'bottomright'}).addTo(map);
    
});
/*--------------------- BUTTONS EVENTS ---------------------*/   
$('#newsB').on('click', () => {
  $('#newsModal').modal('show');
});
$('#covidB').on('click', () => {
  $('#covidModal').modal('show');
});
$('#placesB').on('click', () => {
  $('#placesModal').modal('show');
});
  $('#hide').on('click', () => {
    $('#info').slideToggle();
    $('#infoTop').fadeToggle();
    $('#cloak').fadeToggle();
    $('#scrollDown').toggle();
  });
  
  $('#show').on('click', () => {
    $('#info').slideToggle();
    $('#infoTop').fadeToggle();
    $('#cloak').fadeToggle();

    $('#scrollDown').toggle();
  });

  $('#cloak').on('click', () => {
        $('#info').slideToggle();
        $('#infoTop').fadeToggle();
        $('#cloak').fadeToggle();
        $('#scrollDown').toggle();
    });
      if($('#info').is(':visible')) {
    $(window).on('scroll', function() {
      if($(window).scrollTop() + $(window).height() > $(document).height()-1) {
        $('#info').hide();
        $('#infoTop').fadeIn();
        $('#cloak').fadeOut();
        $('#scrollDown').hide();

      }
    });
  }
  $('#homeLocation').on('click', () => {
    window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname;
  });
  $('#homeLocation2').on('click', () => {
    window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname;
  });
  