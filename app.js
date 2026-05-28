const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const AUTHOR = "Oleksandr Perepelytsia";   
const START_DATE = new Date().toISOString();

console.log(`[${START_DATE}] Autor programu: ${AUTHOR}`);
console.log(`Aplikacja nasłuchuje na porcie: ${PORT}`);

const locations = {
  "Polska": ["Warszawa", "Kraków", "Gdańsk", "Wrocław", "Poznań"],
  "Niemcy": ["Berlin", "Monachium", "Hamburg"],
  "Wielka Brytania": ["Londyn", "Manchester"]
};

app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Pogoda w Dockerze</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f9; }
    h1 { color: #333; }
    select, button { padding: 10px; margin: 5px; font-size: 16px; }
    #weather { margin-top: 20px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); min-height: 160px; }
  </style>
</head>
<body>
  <h1>Aktualna pogoda</h1>
  <p><strong>Autor aplikacji:</strong> ${AUTHOR}</p>

  <label>Kraj: </label>
  <select id="country" onchange="updateCities()">
  </select>

  <label>Miasto: </label>
  <select id="city"></select>

  <button onclick="getWeather()">Pokaż pogodę</button>

  <div id="weather"></div>

  <script>
    const locations = ${JSON.stringify(locations)};

    function updateCities() {
      const country = document.getElementById('country').value;
      const citySelect = document.getElementById('city');
      citySelect.innerHTML = '';
      
      locations[country].forEach(function(city) {
        var option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }

    async function getWeather() {
      const country = document.getElementById('country').value;
      const city = document.getElementById('city').value;
      const weatherDiv = document.getElementById('weather');
      
      weatherDiv.innerHTML = '<p>Ładowanie pogody</p>';

      try {
        const geoRes = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1');
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          weatherDiv.innerHTML = '<p>Nie znaleziono miasta.</p>';
          return;
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;

        const weatherRes = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=' + lat + 
          '&longitude=' + lon + 
          '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code'
        );

        const data = await weatherRes.json();
        const w = data.current;

        const conditions = {
          0: "Bezchmurnie",
          1: "Głównie bezchmurnie",
          2: "Zachmurzenie",
          3: "Duże zachmurzenie",
          45: "Mgła",
          61: "Deszcz",
          71: "Śnieg"
        };

        weatherDiv.innerHTML = 
          '<h2>' + city + ', ' + country + '</h2>' +
          '<p><strong>Temperatura:</strong> ' + w.temperature_2m + ' °C</p>' +
          '<p><strong>Odczuwalna:</strong> ' + w.apparent_temperature + ' °C</p>' +
          '<p><strong>Wilgotność:</strong> ' + w.relative_humidity_2m + ' %</p>' +
          '<p><strong>Wiatr:</strong> ' + w.wind_speed_10m + ' km/h</p>' +
          '<p><strong>Warunki:</strong> ' + (conditions[w.weather_code] || "Nieznane") + '</p>';
      } catch (err) {
        weatherDiv.innerHTML = '<p>Błąd podczas pobierania pogody.</p>';
      }
    }

    window.onload = function() {
      const countrySelect = document.getElementById('country');
      Object.keys(locations).forEach(function(country) {
        var option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
      });
      updateCities();
    };
  </script>
</body>
</html>`;

  res.send(html);
});

app.listen(PORT, () => {
  console.log('Serwer nasłuchuje na porcie ' + PORT);
});