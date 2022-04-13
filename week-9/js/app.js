import { locations } from './locations.js';

window.addEventListener('load', loadNeuralNework)

let nn; let weather; let confidence;
let inputs       = document.getElementsByTagName("input");
let activityList = document.getElementById("activity-list");
let weatherForm  = document.getElementById("weather-form");
weatherForm.addEventListener("submit", submitForm);

function loadNeuralNework() {
    nn = ml5.neuralNetwork({
        task: "classification"
    })

    const modelDetails = {
        model:      "./model/model.json",
        metadata:   "./model/model_meta.json",
        weights:    "./model/model.weights.bin"
    }

    nn.load(modelDetails, modelLoaded);
}

function modelLoaded() {
    for (let input of inputs) {
        input.disabled = false;
    }
}

function submitForm(event) {
    event.preventDefault();

    let precipitation   = document.getElementById("precipitation").value;
    let maxTemp         = document.getElementById("temp-max").value;
    let minTemp         = document.getElementById("temp-min").value;
    
    if (precipitation == "" || maxTemp == "" || minTemp == "") {
        let error = document.createElement("p");
        error.id = "error";
        error.innerHTML = "Fout: sommige velden zijn leeg.";
        weatherForm.insertBefore(error, document.getElementById("first-child"));
    } else {
        let error = document.getElementById("error");
        if (error) {
            weatherForm.removeChild(error);
        }

        const inputs = { 
            precipitation: parseInt(precipitation), 
            maxTemp: parseInt(maxTemp), 
            minTemp: parseInt(minTemp)
        }

        nn.classify(inputs, (error, results) => {
            for (let result of results) {
                confidence = Math.floor(result.confidence * 100);
                if (confidence >= 70) {
                    weather = result.label;
                }
            }

            let message = document.createElement("h1");
            let weatherInDutch;
            switch (weather) {
                case "snow":
                    weatherInDutch = "te gaan sneeuwen"
                    break;
                case "rain":
                    weatherInDutch = "te gaan regenen"
                    break;
                case "drizzle":
                    weatherInDutch = "te gaan regenen"
                    break;
                case "sun":
                    weatherInDutch = "dat het zonnig gaat worden"
                    break;
                case "fog":
                    weatherInDutch = "dat het erg mistig is"
                    break;
                default:
                    weatherInDutch = "dat het lastig te voorspellen is"
                    break;
            }
            console.log(message)
            message.innerHTML = `Het lijkt ${weatherInDutch}.`;
            
            let activities = selectActivities(weather);
            
            activityList.innerHTML = ``;
            
            activityList.appendChild(message);
            for (let activity of activities) {
                showActivity(activity);
            }
        })       
    }
}

function selectActivities(weather) {
    let recommendedActivities = [];

    if (weather == "drizzle" || weather == "rain" || weather == "snow" || weather == "fog") {
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

function showActivity(data) {
    let div = document.createElement("div");
    div.classList.add("activity");

    let title               = document.createElement("h1");
    title.innerHTML         = data.name;
    let description         = document.createElement("p");
    description.innerHTML   = data.description;
    let button              = document.createElement("button");
    button.innerHTML        = "Plan route";

    div.appendChild(title);
    div.appendChild(description);
    div.appendChild(button);

    activityList.appendChild(div);
}