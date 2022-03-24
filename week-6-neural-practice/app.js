import { createChart, updateChart } from "./scatterplot.js"

let nn

let predictionMsg = document.getElementById('prediction')

//
// cars data
//
function createData() {
    let data = [
        { horsepower: 130, mpg: 18 },
        { horsepower: 165, mpg: 15 },
        { horsepower: 225, mpg: 14 },
        { horsepower: 97, mpg: 18 },
        { horsepower: 88, mpg: 27 },
        { horsepower: 193, mpg: 9 },
        { horsepower: 80, mpg: 25 },
    ]

    // pass the data to the showdata function
    showData(data)

    // pass the data to a neural network
    createNeuralNetwork(data)
}

function showData(data) {
    const columns = data.map(car => ({
        x: car.horsepower,
        y: car.mpg
    }))

    createChart(columns)
}


//
// maak en train het neural network
//
async function createNeuralNetwork(data) {
    data.sort(() => (Math.random() - 0.5))

    // maak neural network
    nn = ml5.neuralNetwork({ task: 'regression', debug: true})

    // voeg data toe aan neural network met addData
    for (let car of data) {
        nn.addData({hp: car.horsepower}, {mpg: car.mpg})
    }

    // train neural network
    nn.normalizeData()
    nn.train({ epochs: 15}, () => trainingFinished())
}


//
// predictions
//
async function trainingFinished() {
    // doe een voorspelling voor horsepower 220 om te zien of het werkt
    let testCar = { horsepower: 200 }
    
    // maak een voorspelling voor elke horsepower, sla op in array
    let prediction = await nn.predict({hp: testCar.horsepower})
    
    // toon de hele predictions array in de scatterplot 
    predictionMsg.innerHTML = prediction[0].mpg

    updateChart("New addiion", [{y: prediction[0].mpg, x: testCar.horsepower}])
}

// start de applicatie
createData()