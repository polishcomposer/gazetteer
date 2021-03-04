$(window).on('load', function () {
  if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow', function () {
      $(this).remove();
    });
  }
});
let Lat, Long, covidNews = 0;
navigator.geolocation.getCurrentPosition(function success(position) {
  Lat = position.coords.latitude;
  Long = position.coords.longitude;

  requests(0, Lat, Long);
  function requests(change, userLat = '', userLong = '', iso2 = '', viewCapital = '', viewCountry = '') {
    $.ajax({
      url: "libs/php/getInfo.php",
      type: 'POST',
      dataType: 'json',
      data: {
        lat: userLat,
        lng: userLong,
        change: change,
        iso2: iso2
      },

      success: function (result) {
        if (result.status.name == "ok") {
          console.log(result);
          if(change==1) {
            userLat = result['data']['capital'][1][0]['latitude'];
            userLong = result['data']['capital'][1][0]['longitude'];
          }
          
          const iso2 = result['data']['location']['results'][0]['components']['ISO_3166-1_alpha-2'];

          let countryBorders;
          countryBorders = L.geoJSON(result['data']['countryBorder'],
            {
              style: {
                "color": "gold",
                "weight": 3,
                "opacity": 0.85
              }
            }).addTo(map);
          map.fitBounds(countryBorders.getBounds());
          let homeIcon = L.icon({
            iconUrl: 'libs/img/homeMarker.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [1, -40]
          });
          let marker = L.marker([userLat, userLong], { icon: homeIcon }).addTo(map);
          let markerText = `You are here: <b>${result['data']['location']['results'][0]['formatted']}</b>`;
          marker.bindPopup(markerText).openPopup();
          /*--------------------- PLACES INFO ---------------------*/
          let placesList = '<dl>';
          for (let plA = 0; plA < result['data']['places']['geonames'].length; plA++) {
            placesList += `<dt>${result['data']['places']['geonames'][plA]['title']}</dt><dd><a href="http://${result['data']['places']['geonames'][plA]['wikipediaUrl']}" target="_blank">${result['data']['places']['geonames'][plA]['summary']}</a></dd>`;
          }
          placesList += '</dl>';
          $('#places').html(placesList);
          /*--------------------- POPULATION INFO ---------------------*/
          $('#regionAnswer').html(result['data']['population']['region']);
          let getPopulation;
          if (result['data']['population']['population'].length <= 3) {
            getPopulation = result['data']['population']['population'];
          } else {
            function reverseString(s) {
              return s.split("").reverse().join("");
            }
            let firstPop = result['data']['population']['population'].toString();
            let secondPop = reverseString(firstPop).match(new RegExp('.{1,3}', 'g'));
            getPopulation = reverseString(secondPop.join(','));
          }

          let langA, languagesA = '';
          if (result['data']['population']['languages'].length > 1) {
            langA = 'Languages';
            for (let a = 0; a < result['data']['population']['languages'].length; a++) {
              if (a == result['data']['population']['languages'].length - 1) {
                languagesA += result['data']['population']['languages'][a]['name'];
              } else {
                languagesA += result['data']['population']['languages'][a]['name'] + ', ';
              }
            }
          } else {
            langA = 'Language';
            languagesA = result['data']['population']['languages'][0]['name'];
          }
          $('#languagesAnswer').html(`<span class="what">${langA}: </span><span class="answer" >${languagesA}</span><br>`);
          $('#populationAnswer').html(getPopulation);
          if (viewCapital == 'Somaliland' || viewCapital == 'N. Cyprus' || viewCapital == 'Kosovo') {
            $('#capitalAnswer').html('-');
          } else {
            $('#capitalAnswer').html(result['data']['population']['capital']);
          }

          $('#countryHeader').html(`<img src="https://www.countryflags.io/${iso2}/shiny/64.png"><h2>${result['data']['location']['results'][0]['components']['country']}</h2>`);
          if (viewCapital == '') {
            $('#userLocationWithFlag').html(`<span class="what">Your location:</span><span class="answer" > ${result['data']['location']['results'][0]['formatted']}</span><br>`);
          }
          $('#timezoneAnswer').html(result['data']['location']['results'][0]['annotations']['timezone']['name']);

          /*--------------------- NEWS SECTION ---------------------*/
          let getNews = result['data']['News']['data'];
          $('#countryNews').html(`<img src="libs/img/news.png" alt="news"><b>${getNews[0]['title']}</b><br><a href="${getNews[0]['url']}">${getNews[0]['snippet']}</a>`);

          let newsList = '<dl>';
          for (let nA = 0; nA < getNews.length; nA++) {
            newsList += `<dt>${getNews[nA]['title']}</dt><dd><img src="libs/img/news.png" alt="news"><a href="${getNews[nA]['url']}" target="_blank">${getNews[nA]['snippet']}</a></dd>`;
          }
          newsList += '</dl>';
          $('#allNews').html(newsList);

          /*--------------------- COVID-19 SECTION ---------------------*/
         
          $('.covidHeader').html(`<img src="libs/img/covid.png" alt="covid" title="COVID-19"><h2>COVID-19</h2>`);
           if (result['data']['covidStats']) {
            function spreadN(s) {
              if (s > 0) {
                const string = s.toString();
                const reverse = string.split("").reverse().join("");
                const match = reverse.match(new RegExp('.{1,3}', 'g'));
                const join = match.join(' ');
                return join.split("").reverse().join("");
              } else {
                return '0';
              }
            }
            const covidData = result['data']['covidStats'][0];
            const confirmed = covidData['confirmed'];
            const critical = confirmed-(covidData['deaths']+covidData['recovered']);
            const deaths = covidData['deaths'];
            const recovered = covidData['recovered'];
            const deathRate = deaths/confirmed;
            $('.covidCountry').html(`<span class="covidE">Confirmed: </span><b>${spreadN(confirmed)}</b><br>
                    <span class="covidE">Active: </span><b>${spreadN(critical)}</b><br>
                    <span class="covidE">Recovered: </span><span id="recovered">${spreadN(recovered)}</span><br>
                    <span class="covidE">Deaths: </span><span id="dead">${spreadN(deaths)}</span><br>
                    <span class="covidE">Death rate: </span><b>${Math.round(deathRate * 100)/100} %</b>`);

            $('.covidCountry2').html(`<div id="covidLeftB"><span class="covidE">Confirmed: </span><b>${spreadN(confirmed)}</b><br>
                    <span class="covidE">Active: </span><b>${spreadN(critical)}</b><br>
                    <span class="covidE">Recovered: </span><span id="recovered">${spreadN(recovered)}</span></div>
                    <div id="covidRightB"><span class="covidE">Deaths: </span><span id="dead">${spreadN(deaths)}</span><br>
                    <span class="covidE">Death rate: </span><b>${Math.round(deathRate * 100)/100} %</b>`);
          } else {
            $('#covidCountry').html(`Information about this country is not available.`);
            $('#covidCountry2').html(`Information about this country is not available.`);
          }
          /*--------------------- HOLIDAYS ---------------------*/
          let holidaysList = `<select id="selectHolidays" class="holidaysList">
<option value="" disabled selected>Holidays</option>`;
          let holidaysRecords = result['data']['holidays']['response']['holidays'];
          for (let h = 0; h < holidaysRecords.length; h++) {
            holidaysList += `<option value="${h}">${holidaysRecords[h]['name']}</option>`;
          }
          holidaysList += '</select>';
          $('#selectHoliday').html(holidaysList);
          $('#selectHolidays').change(function () {
            let chosenHoliday = holidaysRecords[$(this).val()];
            $('#holidayName').html(chosenHoliday['name']);
            $('#holidayDescription').html(`<span class="weatherE">Date: </span><b>${chosenHoliday['date']['iso']}</b><br>${chosenHoliday['description']}`);
            $('#holidayModal').modal('show');
          });
          /*--------------------- COUNTRY IMG ---------------------*/
          let photo;
          if (result['data']['countryImg']['total'] < 2) {
            photo = 'libs/img/journey.jpg';
          } else {
            photo = result['data']['countryImg']['hits'][1]['webformatURL'];
          }
          $('#countryPhoto').html(`<img src="${photo}" alt="flag" id="countryPhotoId" >`);
          /*--------------------- INFORMATION SECTION ---------------------*/
          let emergencyText = '<b>Emergency numbers:</b><br>';
          let travelInfo = result['data']['travelInfo'];
          for (const [key, value] of Object.entries(travelInfo['telephone'])) {
            emergencyText += `<span class="weatherE">${key}: </span><b>${value}</b><br>`;
          }
          $('#emergency').html(emergencyText);
          let neighbours = '<span class="weatherE">Neighbours: </span>';
          for (let x = 0; x < travelInfo['neighbors'].length; x++) {
            if (x == travelInfo['neighbors'].length - 1) {
              neighbours += `<b>${travelInfo['neighbors'][x]['name']}</b>`;
            } else {
              neighbours += `<b>${travelInfo['neighbors'][x]['name']}, </b>`;
            }
          }
          $('#neighbours').html(neighbours);
          $('#advise').html(`<br><span class="weatherE">Travel Advise: </span><b>${travelInfo['advise']['CA']['advise']}, ${travelInfo['advise']['UA']['advise']}</b>`);

          /*--------------------- CURRENCY SECTION ---------------------*/
          let currencyInfo = result['data']['location']['results'][0]['annotations']['currency'];
          let selectCurrency = '<select id="selectC">';
          selectCurrency += '<option value="" disabled selected>Choose currency</option>';
          for (const [key, value] of Object.entries(result['data']['currencies'])) {
            selectCurrency += `<option value="${key}">${value}</option>`;
          }
          selectCurrency += '</select>';
          let base;
          if (viewCapital == 'Kosovo') {
            $('#currencyData').html(`<div><span class="currencyE">Name: </span><b>Euro (EUR)</b><br>
<span class="currencyE">Symbol: </span><b>€</b><br>
<span class="currencyE">Subunit: </span><b>Cent</b><br></div>
<div id="curBox"><div id="convertCurrency"><b>Exchange rate:</b><br><div id="calculation">1 EUR = <span id="exResult">?</span></div><br>${selectCurrency}</div><div>`);
            base = 'EUR';
          } else {
            $('#currencyData').html(`<div><span class="currencyE">Name: </span><b>${currencyInfo['name']} (${currencyInfo['iso_code']})</b><br>
<span class="currencyE">Symbol: </span><b>${currencyInfo['symbol']}</b><br>
<span class="currencyE">Subunit: </span><b>${currencyInfo['subunit']}</b><br></div>
<div id="curBox"><div id="convertCurrency"><b>Exchange rate:</b><br><div id="calculation">1 ${currencyInfo['iso_code']} = <span id="exResult">?</span></div><br>${selectCurrency}</div><div>`);
            base = currencyInfo['iso_code'];
          }
          $('#selectC').change(function () {
            let chosenCur = $(this).val();
            $.ajax({
              url: "libs/php/currencyRate.php",
              type: 'POST',
              dataType: 'json',
              data: {
                base: base,
                symbol: chosenCur,
                request: 18
              },
              success: function (chosenC) {
            
                if (chosenC.status.name == "ok") {
                  $('#exResult').html(`${chosenC['data']['conversion_rate']} ${chosenCur}`);
                }
              }, error: function (jqXHR, textStatus, errorThrown) {
                console.log((jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown));
              }
            });

          });
       
          /*--------------------- AIRPORTS SECTION ---------------------*/
          let checkAirportsLayer;
          let allAirports = result['data']['airports']['data'];
          let airportsMarkers = [];
          let airportIcon = L.icon({
            iconUrl: 'libs/img/airportMarker.png',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [1, -40]
          });
          for (let ai = 0; ai < allAirports.length; ai++) {
            airportsMarkers.push(L.marker([allAirports[ai]['location']['latitude'], allAirports[ai]['location']['longitude']], { icon: airportIcon }).bindPopup(allAirports[ai]['name']['original']));
          }
          let airportsLayer = L.layerGroup(airportsMarkers);
          /*--------------------- WEATHER ON THE MAP ---------------------*/ 
          let allWeather = result['data']['citiesWeather']['list'];
          let weatherMarkers = [];
          let weatherIcon;
          let weatherIconInfo = '';
          for (let we = 0; we < allWeather.length; we++) {
            weatherIcon = L.icon({
              iconUrl: "http://openweathermap.org/img/w/" + allWeather[we]['weather'][0]['icon'] + ".png",
              iconSize: [40, 40],
              iconAnchor: [10, 20],
              popupAnchor: [1, -40]
            });
            weatherIconInfo = `<b><span class="weatherIconTitle">${allWeather[we]['weather'][0]['description']}</span></b><br>Temperature: <b>${allWeather[we]['main']['temp']}<sup>o</sup>C</b><br>Humidity: <b>${allWeather[we]['main']['humidity']}%</b><br>
                    Pressure: <b>${allWeather[we]['main']['pressure']} mb</b><br>Wind: <b>${allWeather[we]['wind']['speed']} mph</b><br>`;
            weatherMarkers.push(L.marker([allWeather[we]['coord']['lat'], allWeather[we]['coord']['lon']], { icon: weatherIcon }).bindPopup(weatherIconInfo));
          }
          let weatherLayer = L.layerGroup(weatherMarkers);
          /*--------------------- WEATHER SECTION ---------------------*/
          let currentW = result['data']['weather']['current'];
          let dateNow = new Date();
          let myDate = dateNow.toDateString();
          let myTime = dateNow.toLocaleTimeString();
          let sunrise = new Date(currentW['sunrise']);
          let sunriseTime = sunrise.toLocaleTimeString();
          let sunset = new Date(currentW['sunset']);
          let sunsetTime = sunset.toLocaleTimeString();
          let timeLong;
          if (myTime.length == 10) {
            timeLong = 4;
          } else {
            timeLong = 5;
          }
          $('#weatherToday').html(`<div id="todayWLeft"><h2>Weather</h2><span id="todayD">${myTime.substr(0, timeLong)}${myTime.substr(-2, 2).toLowerCase()}, ${myDate.substr(4, 6)}</span><div id="todayDown"><img src="http://openweathermap.org/img/w/${currentW['weather'][0]['icon']}.png" id="todayWeatherImg" alt="Weather Today">
<span id="todayWeatherTemp">${Math.round(currentW['temp'])}<sup>o</sup>C</span><br>
<span id="todayWeatherDesc">${currentW['weather'][0]['description']}</div></div>
<div id="todayWRight"><span class="weatherE">Feels like: </span><b>${Math.round(currentW['feels_like'])}<sup>o</sup>C</b><br><span class="weatherE">Humidity: </span><b>${currentW['humidity']}%</b><br>
<span class="weatherE">Pressure: </span><b>${currentW['pressure']} hPa</b><br><span class="weatherE">Visibility: </span><b>${currentW['visibility'] / 1000} km</b><br><span class="weatherE">Wind: </span><b>${currentW['wind_speed']} m/s</b> <img src="libs/img/weather/arrow.png" style="transform: rotate(${currentW['wind_deg'] + 180}deg)" alt="wind"></div>
<div id="SunriseInfo"> <img src="libs/img/weather/sunrise.png" alt="sunrise" id="sunriseImg"> <b>Sunrise ${sunriseTime.substring(0, sunriseTime.length - 6)}am</b> Sunset ${sunsetTime.substring(0, sunsetTime.length - 6)}pm</div></span></div>`);
          let newDay, forecast, forecastDate;
          let forecastDays = '';
          for (let dF = 1; dF < 6; dF++) {
            newDay = result['data']['weather']['daily'][dF];
            forecastDate = new Date(dateNow.setDate(dateNow.getDate() + 1));
            forecast = forecastDate.toDateString();
            forecastDays += `<div id="forecastBox"><sub>${forecast.substr(0, 3)},</sub>${forecast.substr(4, 6)}<br>
<img src="http://openweathermap.org/img/w/${newDay['weather'][0]['icon']}.png" id="imgF" alt="Weather on ${forecast}"><br>
${Math.round(newDay['temp']['max'])} / ${Math.round(newDay['temp']['min'])}<sup>o</sup>C
</div>`;
          }
          $('#weatherBoxes').html(forecastDays);
          /*--------------------- MAP BUTTONS ---------------------*/
          let homeButton = L.easyButton('<img src="libs/img/home.png" alt="home" title="Home Location" id="homeImg">', function (btn) {
            let btnMarker = btn;
            if (marker) {
              map.removeLayer(marker);
              btnMarker.button.style.backgroundColor = null;
              marker = null;
            } else {
              btnMarker.button.style.backgroundColor = 'gold';
              marker = L.marker([userLat, userLong], { icon: homeIcon }).bindPopup(markerText).addTo(map);
            }
          }).addTo(map);
          homeButton.button.style.backgroundColor = 'gold';

          let bordersButton = L.easyButton(`<img src="https://www.countryflags.io/${iso2}/shiny/64.png" alt="info" title="Country Info" id="flagImg">`, function (btn) {
            let btnBorders = btn;
            if (countryBorders) {
              map.removeLayer(countryBorders);
              btnBorders.button.style.backgroundColor = null;
              countryBorders = null;
            } else {
              btnBorders.button.style.backgroundColor = 'gold';
              countryBorders = L.geoJSON(result['data']['countryBorder'],
                {
                  style: {
                    "color": "gold",
                    "weight": 3,
                    "opacity": 0.85
                  }
                }).addTo(map);
            }
          }).addTo(map);
          bordersButton.button.style.backgroundColor = 'gold';
   /*--------------------- CITIES ---------------------*/
   let markers, requestCities = 0;
   markers = L.markerClusterGroup();
   let checkCitiesLayer, btnCities;
          let citiesEasyButoon = L.easyButton('<img src="libs/img/city.png" alt="cities" title="Biggest Cities" id="cityImg">', function (btn) {
            btnCities = btn;
            if (checkCitiesLayer) {
              map.removeLayer(markers);
              checkCitiesLayer = null;
              btnCities.button.style.backgroundColor = null;
            } else {
              checkCitiesLayer = map.addLayer(markers);
              btnCities.button.style.backgroundColor = 'gold';
              if(requestCities == 0) {
                getCities();
                requestCities = 1;
              }
            }
          }).addTo(map);
          $('#cities').on('click', () => {
            $('#info').slideUp();
            $('#infoTop').fadeIn();
            $('#cloak').fadeOut();
            $('#scrollDown').toggle();
            checkCitiesLayer = map.addLayer(markers);
            citiesEasyButoon.button.style.backgroundColor = 'gold';
            if(requestCities == 0) {
              getCities();
              requestCities = 1;
            }
          });
          function getCities() {
            $.ajax({
              url: "libs/php/cities.php",
              type: 'POST',
              dataType: 'json',
              data: {
                iso2: result['data']['location']['results'][0]['components']['ISO_3166-1_alpha-2']
              },
              success: function (citiesResult) {
                 if (citiesResult.status.name == "ok") {
          let allCities = citiesResult['data']['cities']['data']['cities'];
        
            let cityIcon = L.icon({
              iconUrl: 'libs/img/cityMarker.png',
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [1, -40]
            });
         
            for (let ci = 0; ci < allCities.length; ci++) {
              markers.addLayer(L.marker([allCities[ci]['latitude'], allCities[ci]['longitude']], { icon: cityIcon }).bindPopup(allCities[ci]['name']));
         
            } 
          }} , error: function (jqXHR, textStatus, errorThrown) {
            console.log((jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown));
          }});
          }
          let airportsEasyButoon = L.easyButton(`<img src="libs/img/airports.png" alt="airports" title="Country Info" id="airportsImg">`, function (btn) {
            let btnAirports = btn;
            if (checkAirportsLayer) {
              map.removeLayer(airportsLayer);
              checkAirportsLayer = null;
              btnAirports.button.style.backgroundColor = null;
            } else {
              checkAirportsLayer = airportsLayer.addTo(map);
              btnAirports.button.style.backgroundColor = 'gold';
            }
          }).addTo(map);
          $('#airports').on('click', () => {
            $('#info').slideUp();
            $('#infoTop').fadeIn();
            $('#cloak').fadeOut();
            $('#scrollDown').toggle();
            checkAirportsLayer = airportsLayer.addTo(map);
            airportsEasyButoon.button.style.backgroundColor = 'gold';
          });

          let checkWeatherLayer;
          let weatherButton = L.easyButton(`<img src="libs/img/weather.png" alt="weather" title="Weather info" id="weatherImg">`, function (btn) {
            let btnWeather = btn;
            if (checkWeatherLayer) {
              map.removeLayer(weatherLayer);
              checkWeatherLayer = null;
              btnWeather.button.style.backgroundColor = null;
            } else {
              checkWeatherLayer = weatherLayer.addTo(map);
              btnWeather.button.style.backgroundColor = 'gold';
            }
          }).addTo(map);
          $('#covidB').on('click', () => {
            $('#covidModal').modal('show');
            if(covidNews == 0) {
              getCovidNews();
                 covidNews = 1;
              }
          });
          let covidButton = L.easyButton('<img src="libs/img/covid.png" alt="covid" title="COVID-19" id="covidImg">', function () {
            $('#covidModal').modal('show');
          if(covidNews == 0) {
            getCovidNews();
               covidNews = 1;
            }
          }).addTo(map);
           /*--------------------- COVID-19 NEWS ---------------------*/ 
          function getCovidNews() {
            $.ajax({
              url: "libs/php/covidNews.php",
              type: 'POST',
              dataType: 'json',

              success: function (covidResult) {
                 if (covidResult.status.name == "ok") {

                  let covidNewsList = '';
                  for (let covA = 0; covA < covidResult['data']['covidNews']['news'].length; covA++) {
                      covidNewsList += `<dt>${covidResult['data']['covidNews']['news'][covA]['reference'].toUpperCase()}</dt><dd><a href="${covidResult['data']['covidNews']['news'][covA]['link']}" target="_blank">${covidResult['data']['covidNews']['news'][covA]['title']}</a></dd>`;
                    }
                  $('.covidArticles').html(covidNewsList);
                  }
             }}); 
            }

          let rubberButton = L.easyButton(`<img src="libs/img/rubber.png" alt="rubber" title="Clean the map" id="rubberImg">`, function () {
            weatherButton.button.style.backgroundColor = null;
            airportsEasyButoon.button.style.backgroundColor = null;
            citiesEasyButoon.button.style.backgroundColor = null;
            homeButton.button.style.backgroundColor = null;
            bordersButton.button.style.backgroundColor = null;
            if (weatherLayer) {
              weatherLayer.remove();
              checkWeatherLayer = null;
            }
            if (checkAirportsLayer) {
              airportsLayer.remove();
              checkAirportsLayer = null;
            }
            if (checkCitiesLayer) {
              map.removeLayer(markers);
              checkCitiesLayer = null;
            }
            if (countryBorders) {
              countryBorders.remove();
              countryBorders = null;
            }
            if (marker) {
              marker.remove();
              marker = null;
            }

          }).addTo(map);
          /*--------------------- COUNTRIES LIST CHANGE EVENT ---------------------*/
          $('.countriesList').change(function () {
            map.removeControl(homeButton);
            map.removeControl(bordersButton);
            map.removeControl(citiesEasyButoon);
            map.removeControl(airportsEasyButoon);
            map.removeControl(weatherButton);
            map.removeControl(covidButton);
            map.removeControl(rubberButton);
            if (weatherLayer) {
              weatherLayer.remove();
              checkWeatherLayer = null;
            }
            if (checkAirportsLayer) {
              airportsLayer.remove();
              checkAirportsLayer = null;
            }
            if (checkCitiesLayer) {
              map.removeLayer(markers);
              checkCitiesLayer = null;
            }
            if (countryBorders) {
              countryBorders.remove();
              countryBorders = null;
            }
            if (marker) {
              marker.remove();
              marker = null;
            }

            requests(1, Lat, Long, $(this).val());

          });

        }
      }, error: function (jqXHR, textStatus, errorThrown) {
        console.log((jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown));
      }
    });
  }
});

/*--------------------- MAP ELEMENTS ---------------------*/

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

L.control.layers(baseMaps, null, { position: 'bottomright' }).addTo(map);
L.control.scale().addTo(map);
/*--------------------- SELECT COUNTRIES ---------------------*/
$.ajax({
  url: "libs/php/countries.php",
  type: 'POST',
  dataType: 'json',
  success: function (selectRequest) {
    if (selectRequest.status.name == "ok") {
      let countries = '<select id="countriesList" class="countriesList">';
      let selected = '';
      countries += '<option value="" disabled selected>Select country</option>';
      for (let [key, value] of Object.entries(selectRequest['data'])) {
        countries += `<option value='${key}' ${selected}>${value}</option>`;
      };
      countries += "</select>";
      document.getElementById('selectCountry').innerHTML = countries;
      document.getElementById('infoSelectCountry').innerHTML = countries;

    }
  }, error: function (jqXHR, textStatus, errorThrown) {
    console.log((jqXHR + '<br/>' + textStatus + '<br/>' + errorThrown));
  }
});
/*--------------------- BUTTONS EVENTS ---------------------*/
$('#newsB').on('click', () => {
  $('#newsModal').modal('show');
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
if ($('#info').is(':visible')) {
  $(window).on('scroll', function () {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 1) {
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