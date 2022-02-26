let model,videoWidth, videoHeight, ctx, canvas;

// Array positions of phalanges
let fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
};

async function main() {
    model = await handpose.load();
    const video = await startVideo();
    video.play();
    startLandmarkDetection(video);
}

async function startVideo() {
    const video = document.getElementById('video');

    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 720, height: 405 } });
    video.srcObject = stream;

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    });
}

async function startLandmarkDetection(video) {
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;

    canvas = document.getElementById("output");

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "red";

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    predictLandmarks();
}

async function predictLandmarks() {
    ctx.drawImage(video,0,0,videoWidth,videoHeight,0,0,canvas.width,canvas.height);
    const predictions = await model.estimateHands(video);
    
    if (predictions.length > 0) {
        const result = predictions[0].landmarks;
        drawKeypoints(ctx, result, predictions[0].annotations);

        let yPosThumb  = Math.round(predictions[0].annotations.thumb[3][1]);
        let yPosIndex  = Math.round(predictions[0].annotations.indexFinger[3][1]);
        let yPosMiddle = Math.round(predictions[0].annotations.middleFinger[3][1]);
        let yPosRing   = Math.round(predictions[0].annotations.ringFinger[3][1]);
        let yPosPinky  = Math.round(predictions[0].annotations.pinky[3][1]);

        const maximums = [yPosThumb, yPosIndex, yPosMiddle, yPosRing, yPosPinky];

        let resultMessage = document.getElementById("result");

        switch (whatFingerIsRaised(maximums)) {
            case yPosThumb:
                resultMessage.innerHTML = `Everything is A-okay 👍`;
                break;
            case yPosIndex:
                resultMessage.innerHTML = `What are you pointing at?`;
                break;
            case yPosMiddle:
                resultMessage.innerHTML = `🖕`;
                break;
            case yPosRing:
                resultMessage.innerHTML = `Impressive, I can't do that.`;
                break;
            case yPosPinky:
                resultMessage.innerHTML = `Pinky swear?`;
                break;
            default:
                break;
        }
    };

    setTimeout(() => predictLandmarks(), 200);
}

function whatFingerIsRaised(predictionNumbers) {
    if (predictionNumbers.length <= 0) {
        return 0;
    }

    // The one closest to zero, is the finger that's raised
    let closest = 0;
    for (let predictionNumber of predictionNumbers) {
        if (closest === 0) {
            closest = predictionNumber;
        } else if (predictionNumber > 0 && predictionNumber <= Math.abs(closest)) {
            closest = predictionNumber;
        } else if (predictionNumber < 0 && predictionNumber < Math.abs(closest)) {
            closest = predictionNumber;
        }
    }

    return closest;
}

function drawKeypoints(ctx, keypoints) {
    const keypointsArray = keypoints;

    for (let i = 0; i < keypointsArray.length; i++) {
        const y = keypointsArray[i][0];
        const x = keypointsArray[i][1];
        drawPoint(ctx, x - 2, y - 2, 3);
    }

    const fingers = Object.keys(fingerLookupIndices);

    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i];
        const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
        drawPath(ctx, points, false);
    }
}

function drawPoint(ctx, y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawPath(ctx, points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);

    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point[0], point[1]);
    }

    if (closePath) {
        region.closePath();
    }
    ctx.stroke(region);
}

main();