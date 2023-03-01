const API_KEY = "b75e5bce24d64330a5972304230103"

let apiResponseCurrentWeather;
let apiResponseWeatherForecast;
let apiResponseAstronomy;


async function Load(){
    await CallApiCurrentWeather("London");
    await CallApiWeatherForecast("London");
    await CallApiAstronomy("London");

    console.log(apiResponseCurrentWeather);
    console.log(apiResponseWeatherForecast);
    console.log(apiResponseAstronomy);
}

async function CallApiCurrentWeather(q){
    const CALL_URL = "http://api.weatherapi.com/v1/current.json?key=$key&q=$q&aqi=$aqi";

    const GET_AQI = "no"

    // bind params
    let callUrl = CALL_URL;
    callUrl = callUrl.replaceAll("$key", API_KEY);
    callUrl = callUrl.replaceAll("$q", q);
    callUrl = callUrl.replaceAll("$aqi", GET_AQI);

    apiResponseCurrentWeather = await CallApi(callUrl);
}

async function CallApiWeatherForecast(q){
    const CALL_URL = "http://api.weatherapi.com/v1/forecast.json?key=$key&q=$q&days=$days&aqi=$aqi&alerts=$alerts";

    const DAYS = 3;
    const GET_AQI = "no";
    const GET_ALERTS = "no";

    // bind params
    let callUrl = CALL_URL;
    callUrl = callUrl.replaceAll("$key", API_KEY);
    callUrl = callUrl.replaceAll("$q", q);
    callUrl = callUrl.replaceAll("$days", DAYS);
    callUrl = callUrl.replaceAll("$aqi", GET_AQI);
    callUrl = callUrl.replaceAll("$alerts", GET_ALERTS);

    apiResponseWeatherForecast = await CallApi(callUrl);
}

async function CallApiAstronomy(q){
    const CALL_URL = "http://api.weatherapi.com/v1/astronomy.json?key=$key&q=$q&dt=$dt";

    let date = new Date();
    let dt = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

    // bind params
    let callUrl = CALL_URL;
    callUrl = callUrl.replaceAll("$key", API_KEY);
    callUrl = callUrl.replaceAll("$q", q);
    callUrl = callUrl.replaceAll("$dt", dt);

    apiResponseAstronomy = await CallApi(callUrl);
}

// Function that calls an api with the URL passed by parameter, if the request was successfull it returns the response
async function CallApi(callUrl){
    let myURL = await fetch(callUrl);

    if(myURL.status == 200){
        let myResponse = await myURL.text();

        return JSON.parse(myResponse);
    }
}