const classifier = ml5.imageClassifier('MobileNet', modelLoaded);
let statusMessage, predictionMessage, secondaryResults;
const image = document.getElementById('output')
const fileButton = document.querySelector("#file")
let synth = window.speechSynthesis;

function modelLoaded() {
  statusMessage = document.getElementById('status');
  statusMessage.innerHTML = `Model loaded, version using: ${ml5.version}`;
}

image.addEventListener('load', () => startPrediction())

function startPrediction() {
  predictionMessage = document.getElementById('prediction');
  secondaryResults = document.getElementById('secondary-results');

  classifier.classify(document.getElementById('output'), (err, results) => {
    predictionMessage.innerHTML = `I am ${results[0].confidence.toFixed(2) * 100}% confident, that this is a ${results[0].label}.`;
    secondaryResults.innerHTML = `Other results are ${results[1].label} (${results[1].confidence.toFixed(2) * 100}%) and
                                    ${results[2].label} (${results[2].confidence.toFixed(2) * 100}%).`
  
    speak(predictionMessage.innerHTML);
  });
}

function speak(text) {
  if (synth.speaking) {
    return;
  }
  if (text !== '') {
    let utterThis = new SpeechSynthesisUtterance(text);
    synth.speak(utterThis);
  }
}

fileButton.addEventListener("change", (event)=>loadFile(event))

function loadFile(event) {
	image.src = URL.createObjectURL(event.target.files[0])
}
