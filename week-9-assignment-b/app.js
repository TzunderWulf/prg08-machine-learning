import { createChart, updateChart } from "./scatterplot.js";

let nn, weather, confidence;

let predictionButton        = document.getElementById("prediction-btn");
predictionButton.addEventListener("click", predictWeather);

let precipitationInput      = document.getElementById("precipitation");
let minTempInput            = document.getElementById("min-temp");
let maxTempInput            = document.getElementById("max-temp");
let windSpeedInput          = document.getElementById("wind-speed");

let errorMessage            = document.getElementById("error");
let predictionMessage       = document.getElementById("prediction")

// Create location data, whether activity is out- or indoors
let locations = [
    { name: "Maritiem Museum", outdoors: false },
    { name: "Euromast", outdoors: true },
    { name: "De verwoeste stad", outdoors: true },
    { name: "Markthal", outdoors: false },
    { name: "Beeld van Erasmus", outdoors: true },
    { name: "Erasmusbrug", outdoors: true }
];

function loadData() {
    Papa.parse("./data/weather.csv", {
        download: true,
        header: true, 
        dynamicTyping: true,
        complete: results => {
            for (let day of results.data) {
                if (day.weather == "rain") {
                    day.weather = 1;
                }
                if (day.weather == "snow") {
                    day.weather = 2;
                }
                if (day.weather == "drizzle") {
                    day.weather = 3;
                }
                if (day.weather == "fog") {
                    day.weather = 4;
                }
                if (day.weather == "sun") {
                    day.weather = 5;
                }
            }
            drawWeatherVersusTemperature(results.data);
            drawWeatherVersusPrecipitation(results.data);
            drawWeatherVersusWind(results.data);
        },
        
    })
}

function drawWeatherVersusTemperature(data) {
    const chartdata = data.map(day => ({
        x: day.weather,
        y: day.temp_max,
    }))

    const chartdata2 = data.map(day => ({
        x: day.weather,
        y: day.temp_min,
    }))
    
    createChart(chartdata, "max temperatuur vs weer", "weer", "temperatuur", "temp-weather-chart");
    updateChart("min temperatuur vs weer", chartdata2)
}

function drawWeatherVersusPrecipitation(data) {
    const chartdata = data.map(day => ({
        x: day.weather,
        y: day.precipitation,
    }))
    
    createChart(chartdata, "neerslag vs weer", "weer", "neerslag", "precipitation-weather-chart");
}

function drawWeatherVersusWind(data) {
    const chartdata = data.map(day => ({
        x: day.weather,
        y: day.wind,
    }))
    
    createChart(chartdata, "windkracht vs weer", "weer", "windkracht", "windspeed-weather-chart");
}

function loadNeuralNework() {
    nn = ml5.neuralNetwork({
        task: "classification"
    });

    const modelDetails = {
        model: "model/model.json",
        metadata: "model/model_meta.json",
        weights: "model/model.weights.bin"
    }
    nn.load(modelDetails, modelLoaded)
}

function modelLoaded() {
    predictionButton.disabled = false;
}

function predictWeather() {
    if (precipitationInput.value != "" && minTempInput.value != "" && maxTempInput.value != "" && windSpeedInput.value != "") {
        errorMessage.innerHTML = ``;

        let precipitation = parseFloat(precipitationInput.value);
        let minTemp = parseFloat(minTempInput.value);
        let maxTemp = parseFloat(maxTempInput.value);
        let windSpeed = parseFloat(windSpeedInput.value);

        const inputs = { precipitation: precipitation, minTemp: minTemp, maxTemp: maxTemp, wind: windSpeed }
        nn.classify(inputs, (error, results) => {
            console.log(results)
            for (let result of results) {
                if (result.confidence >= 0.5) {
                    weather     = result.label;
                    confidence  = Math.floor(result.confidence * 100)
                }
            }

            if (confidence >= 0.5) {
                let activities = selectActivities(weather);

                let activityList = document.getElementById("activity-list");
                activityList.innerHTML = ``;
    
                predictionMessage.innerHTML = `De kans is ${confidence}% dat het weer is ${weather}. Dit zijn aanraders voor activiteiten:`
    
                for (let activity of activities) {
                    showActivity(activity, activityList)
                }
            } else {
                predictionMessage.innerHTML = `Het is lastig te bepalen.`
            }

        })
    } else {
        errorMessage.innerHTML = `Vul alle velden in.`;
    }
}

function selectActivities(weather) {
    let recommendedActivities = [];

    if (weather == "drizzle" || weather == "rain" || weather == "snow") {
        for (let location of locations) {
            if (!location.outdoors) {
                recommendedActivities.push(location);
            } 
        }
    } else {
        for (let location of locations) {
            if (location.outdoors) {
                recommendedActivities.push(location);
            } 
        }
    }
    return recommendedActivities;
}

function showActivity(information, parentNode) {
    let div = document.createElement("div");
    div.classList.add("activity");
    let title = document.createElement("h3");
    title.innerHTML = information.name;
    div.appendChild(title);
    parentNode.appendChild(div);
}

loadData();
loadNeuralNework();