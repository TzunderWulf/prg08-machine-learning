import { DecisionTree } from "./libraries/decisiontree.js"
import { VegaTree } from "./libraries/vegatree.js"

const csvFile = "./data/mushrooms.csv"
const trainingLabel = "class"
const ignored = ['class'];
let amountGood = 0;

// first word is weither it predicted right, second actual label
let goodAndDeadly = 0;
let goodAndOkay = 0;
let wrongButDeadly = 0;
let wrongButOkay = 0;

// inladen csv data
function loadData() {
    Papa.parse(csvFile, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => { 
            trainModel(results.data);
        }
    })
}

//
// MACHINE LEARNING - Bouw de Decision Tree
//
function trainModel(data) {
    let trainData = data.slice(0, Math.floor(data.length * 0.8));
    let testData = data.slice(Math.floor(data.length * 0.8) + 1);

    let decisionTree = new DecisionTree({
        ignoredAttributes: ignored,
        trainingSet: trainData,
        categoryAttr: trainingLabel
    })

    // Teken de boomstructuur - DOM element, breedte, hoogte, decision tree
    let visual = new VegaTree('#view', 800, 400, decisionTree.toJSON());
    let amountMushroom = 0;

    for (let mushroom of testData) {
        testMushroom(mushroom, decisionTree);
        amountMushroom++;
    }

    let accuracy = Math.floor(amountGood / testData.length * 100);
    let e = document.getElementById("accuracy");
    e.innerHTML = `Accuracy: ${accuracy}%`;

    let a = document.getElementById('good-and-okay');
    a.innerHTML = goodAndOkay;
    let b = document.getElementById('wrong-but-okay');
    b.innerHTML = wrongButOkay;
    let c = document.getElementById('good-and-deadly');
    c.innerHTML = goodAndDeadly;
    let d = document.getElementById('wrong-but-deadly');
    d.innerHTML = wrongButDeadly;
}

function testMushroom(mushroom, decisionTree) {
    const mushroomWithoutLabel = Object.assign({}, mushroom);
    delete mushroomWithoutLabel.class;

    let prediction = decisionTree.predict(mushroomWithoutLabel);
    
    if (prediction == 'p' && mushroom.class == 'p') {
        goodAndDeadly++;
        amountGood++;
    } else if (prediction == 'e' && mushroom.class == 'e') {
        goodAndOkay++;
        amountGood++;
    } else if (prediction == 'e' && mushroom.class == 'p') {
        wrongButDeadly++;
    } else if (prediction = 'p' && mushroom.class == 'e') {
        wrongButOkay++;
    }
    return amountGood, goodAndDeadly, goodAndOkay, wrongButDeadly, wrongButOkay;
}

loadData()
