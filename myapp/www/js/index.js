const API_KEY = "b75e5bce24d64330a5972304230103";

const DAYS_OF_THE_WEEK = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

const IMAGE_FILE_PATH = "assets/weather/";

const BG_COLOR_DAY = "#47acff";
const BG_COLOR_NIGHT = "#034ba3";


let lat;
let lon;

let apiResponseCurrentWeather;
let apiResponseWeatherForecast;
let apiResponseAstronomy;



function load(){
    document.addEventListener("deviceready", onDeviceReady, false);
}

async function onDeviceReady(){
    // block the phone orientation
    screen.orientation.lock('portrait');

    // wait for a position
    await new Promise((resolve) => getPosition(resolve));

    // call APIs
    let q = `${lat},${lon}`;
    await callApiCurrentWeather(q);
    await callApiWeatherForecast(q);
    await callApiAstronomy(q);

    // if all the responses were successfull display values
    if(
        apiResponseCurrentWeather !== undefined &&
        apiResponseWeatherForecast !== undefined &&
        apiResponseAstronomy !== undefined
    ){
        displayWeather();
    }
}

// Gets current phone position
async function getPosition(callback) {
    const DEFAULT_LAT = 51.52; // London lat
    const DEFAULT_LON = -0.11; // London lon

    let options = {
        enableHighAccuracy: true,
        maximumAge: 3600000
    }

    // get current position
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

    // on success assign lat,lon
    function onSuccess(position) {
        lat = position.coords.latitude;
        lon = position.coords.longitude;

        callback();
    };

    // on error assign default values and log the error to the console
    function onError(error) {
        lat = DEFAULT_LAT;
        lon = DEFAULT_LON;

        console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');

        callback();
    }
}

async function callApiCurrentWeather(q){
    const CALL_URL = "https://api.weatherapi.com/v1/current.json?key=$key&q=$q&aqi=$aqi";

    const GET_AQI = "no"

    // bind params
    let callUrl = CALL_URL;
    callUrl = callUrl.replaceAll("$key", API_KEY);
    callUrl = callUrl.replaceAll("$q", q);
    callUrl = callUrl.replaceAll("$aqi", GET_AQI);

    apiResponseCurrentWeather = await callApi(callUrl);
}

async function callApiWeatherForecast(q){
    const CALL_URL = "https://api.weatherapi.com/v1/forecast.json?key=$key&q=$q&days=$days&aqi=$aqi&alerts=$alerts";

    const DAYS = 5;
    const GET_AQI = "no";
    const GET_ALERTS = "no";

    // bind params
    let callUrl = CALL_URL;
    callUrl = callUrl.replaceAll("$key", API_KEY);
    callUrl = callUrl.replaceAll("$q", q);
    callUrl = callUrl.replaceAll("$days", DAYS);
    callUrl = callUrl.replaceAll("$aqi", GET_AQI);
    callUrl = callUrl.replaceAll("$alerts", GET_ALERTS);

    apiResponseWeatherForecast = await callApi(callUrl);
}

async function callApiAstronomy(q){
    const CALL_URL = "https://api.weatherapi.com/v1/astronomy.json?key=$key&q=$q&dt=$dt";

    let date = new Date();
    let dt = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

    // bind params
    let callUrl = CALL_URL;
    callUrl = callUrl.replaceAll("$key", API_KEY);
    callUrl = callUrl.replaceAll("$q", q);
    callUrl = callUrl.replaceAll("$dt", dt);

    apiResponseAstronomy = await callApi(callUrl);
}

// Function that calls an api with the URL passed by parameter, if the request was successfull it returns the response
async function callApi(callUrl){
    let myURL = await fetch(callUrl);

    if(myURL.status == 200){
        let myResponse = await myURL.text();

        return JSON.parse(myResponse);
    }
}

// Changes the document to display weather information
function displayWeather(){
    console.log(apiResponseCurrentWeather);
    console.log(apiResponseWeatherForecast);
    console.log(apiResponseAstronomy);

    let currentWeather = apiResponseCurrentWeather["current"];
    let location = apiResponseCurrentWeather["location"]
    let weatherForecast = apiResponseWeatherForecast["forecast"]
    let astronomy = apiResponseAstronomy["astronomy"]["astro"];

    let sunriseHour = astronomy["sunrise"];
    let sunsetHour = astronomy["sunset"];

    let isItDay = isDay(sunriseHour, sunsetHour);

    let weatherConditionImage = getWeatherConditionImage(currentWeather["condition"]["code"] ,isItDay);

    // Change bg color
    if(isItDay){
        document.body.style.backgroundColor = BG_COLOR_DAY;
    }else{
        document.body.style.backgroundColor = BG_COLOR_NIGHT;
    }

    // todo : moon phase image

    // Main info
    document.getElementById("weather-cond-image").src = weatherConditionImage;
    document.getElementById("Temp").innerHTML = currentWeather["temp_c"];
    document.getElementById("FeelsLike").innerHTML = currentWeather["feelslike_c"];
    document.getElementById("Location").innerHTML = location["name"];

    // Secondary info
    document.getElementById("MaxTemp").innerHTML = weatherForecast["forecastday"][0]["day"]["maxtemp_c"];
    document.getElementById("MinTemp").innerHTML = weatherForecast["forecastday"][0]["day"]["mintemp_c"];
    document.getElementById("Humidity").innerHTML = currentWeather["humidity"];
    document.getElementById("WindSpeed").innerHTML = currentWeather["wind_kph"];
    document.getElementById("Precipitation").innerHTML = currentWeather["precip_mm"];

    // Forecast
    let date = new Date();
    document.getElementById("fc1Image").src = weatherConditionImage;
    document.getElementById("fc1MaxTemp").innerHTML = Math.round(weatherForecast["forecastday"][0]["day"]["maxtemp_c"]);
    document.getElementById("fc1MinTemp").innerHTML = Math.round(weatherForecast["forecastday"][0]["day"]["mintemp_c"]);

    date = new Date(date.setDate(date.getDate() + 1));
    document.getElementById("fc2Date").innerHTML = DAYS_OF_THE_WEEK[date.getDay()];
    document.getElementById("fc2Image").src = getWeatherConditionImage(weatherForecast["forecastday"][1]["day"]["condition"]["code"], true);
    document.getElementById("fc2MaxTemp").innerHTML = Math.round(weatherForecast["forecastday"][1]["day"]["maxtemp_c"]);
    document.getElementById("fc2MinTemp").innerHTML = Math.round(weatherForecast["forecastday"][1]["day"]["mintemp_c"]);

    date = new Date(date.setDate(date.getDate() + 1));
    document.getElementById("fc3Date").innerHTML = DAYS_OF_THE_WEEK[date.getDay()];
    document.getElementById("fc3Image").src = getWeatherConditionImage(weatherForecast["forecastday"][2]["day"]["condition"]["code"], true);
    document.getElementById("fc3MaxTemp").innerHTML = Math.round(weatherForecast["forecastday"][2]["day"]["maxtemp_c"]);
    document.getElementById("fc3MinTemp").innerHTML = Math.round(weatherForecast["forecastday"][2]["day"]["mintemp_c"]);

    // Astronomy
    document.getElementById("sunriseHour").innerHTML = sunriseHour;
    document.getElementById("sunsetHour").innerHTML = sunsetHour;
    document.getElementById("moonPhase").innerHTML = astronomy["moon_phase"];
}

// Returns the weather condition image, depending on the weather condition code and if its the day or not
function getWeatherConditionImage(weatherConditionCode, isDay){
    let image = "";

    weatherConditions.forEach(
        function(item){
            if(item["codes"].includes(weatherConditionCode)){
                if(isDay){
                    image = item["dayImage"];
                }else{
                    image = item["nightImage"];
                }
            }
        }
    );

    return IMAGE_FILE_PATH + image;
}

// Return if its currently the day, depending on the sunrise and sunset hours
function isDay(sunriseHour, sunsetHour){
    let date = new Date();

    // todo : get location time instead of phone time (Ex: phone is in UTC+6, but the current location is in UTC+1)
    let currentMinute = date.getHours() * 60 + date.getMinutes();

    // get sunrise minute
    let sunriseTimeSeparated = sunriseHour.slice(0, -3).split(':').map(
        item => parseInt(item)
    );
    let sunriseMinute = sunriseTimeSeparated[0] * 60 + sunriseTimeSeparated[1];

    // get sunset minute
    let sunsetTimeSeparated = sunsetHour.slice(0, -3).split(':').map(
        item => parseInt(item)
    );
    let sunsetMinute = (sunsetTimeSeparated[0] + 12) * 60 + sunsetTimeSeparated[1];

    // if the current minute is after the sunrise and before the sunset, its the day, else its the night
    if(currentMinute > sunriseMinute && currentMinute < sunsetMinute)
    {
        return true;
    }
    else
    {
        return false;
    }
}