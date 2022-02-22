const featureExtractor = ml5.featureExtractor('MobileNet', modelLoaded);

let classifier, video, maskButton, noMaskButton, trainButton, saveButton, loadButton, message;
let amountPhotosMask = 0;
let amountPhotosNoMask = 0;

window.addEventListener('load', init)

function init() {
    video = document.getElementById('webcam');

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((err) => {
                console.log(`Something went wrong... :(`)
            })
    }

    message = document.getElementById('message');

    maskButton = document.getElementById('mask');
    noMaskButton = document.getElementById('no-mask');
    trainButton = document.getElementById('train');
    saveButton = document.getElementById('save');
    loadButton = document.getElementById('load');

    maskButton.addEventListener('click', addMaskImage);
    noMaskButton.addEventListener('click', addNoMaskImage);
    trainButton.addEventListener('click', trainModel);
    saveButton.addEventListener('click', saveModel);
    loadButton.addEventListener('change', (event) => { loadModel(event) })
}

function modelLoaded() {
    classifier = featureExtractor.classification(video);
    message.innerHTML = `Model loaded, version ${ml5.version}`;
}

function addMaskImage() {
    classifier.addImage(video, 'wearing a mask', () => {
        amountPhotosMask++;
        message.innerHTML = `${amountPhotosMask} photo('s) taken with mask.`;
    })

}

function addNoMaskImage() {
    classifier.addImage(video, 'not wearing a mask', () => {
        amountPhotosNoMask++;
        message.innerHTML = `${amountPhotosNoMask} photo('s) taken without mask.`;
    })
}

function trainModel() {
    message.innerHTML = `Training in progress, please wait.`
    classifier.train((lossValue) => {
        if(lossValue == null) {
            message.innerHTML = `Finished training, after five seconds it will start classifying.`;
            setTimeout(startClassifying, 5000);
        }
    })
}

function saveModel() {
    classifier.save((err) => {
        if (err) saveButton.innerHTML = `Failed`.
        saveButton.innerHTML = `Saved!`;
    });
}

function loadModel(event) {
    for (let file of event.target.files) {
        let fileURL = URL.createObjectURL(file);
        console.log(fileURL)
        classifier.load(fileURL);
    }
}

function startClassifying() {
    setInterval(()=>{
        classifier.classify(video, (err, result) => {
            if (err) { 
                message.innerHTML = err
            }
            message.innerHTML = `You are ${result[0].label}.`
        })
    }, 1000)
}