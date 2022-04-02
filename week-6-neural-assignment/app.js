import { createChart, updateChart } from "./scatterplot.js"
let nn;

//
//load data
//
function loadData() {
    Papa.parse("./data/cars.csv", {
        download: true,
        header: true, 
        dynamicTyping: true,
        complete: results => {
            drawScatterplot(results.data),
            createNeuralNetwork(results.data);
        },
        
    })
}

//
// teken een scatterplot
//
function drawScatterplot(data) {
    const chartdata = data.map(car => ({
        x: car.horsepower,
        y: car.mpg,
    }))
    
    createChart(chartdata)
}

//
// maak en train het neural network
//
async function createNeuralNetwork(data) {
    // maak neural network
    const options = { task: 'regression', debug: true }
    nn = ml5.neuralNetwork(options)

    // voeg data toe aan neural network met addData
    data.sort(() => (Math.random() - 0.5))
    // console.log(data[0].weight)
    for (let car of data) {
        nn.addData({ horsepower: car.horsepower, weight: car.weight }, { mpg: car.mpg })
    }
    nn.normalizeData()

    // train neural network
    nn.train({ epochs: 10 }, () => trainingFinished()) 
    
}


//
// predictions
//
async function trainingFinished() {
    // doe een voorspelling voor horsepower 220 om te zien of het werkt
    const testCar = { horsepower: 90, weight:3000}

    // maak een voorspelling voor elke horsepower, sla op in array
    const results = await nn.predict(testCar)
    console.log(results)
    
    // toon de hele predictions array in de scatterplot 
    const prediction = results[0].value
    console.log(`Geschat verbruik: ${prediction}`)

    const chartresults = []

    for(let hp = 40; hp<250; hp+=2) {
        const results = await nn.predict({horsepower:hp, weight:3000})
        chartresults.push({ x: hp, y: results[0].value})
    }

    updateChart("Predictions", chartresults)
}


// start de applicatie
loadData()