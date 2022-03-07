const result = document.querySelector("#result");
const submit = document.getElementById('classifybtn');

submit.addEventListener('click', submitForm)

// maak een knear instance
const k = 3;
const machine = new kNear(k);

// leer een kat
machine.learn([18, 9.2, 8.1, 2], "cat");
machine.learn([20.1, 17, 15.5, 5], "dog");
machine.learn([17, 9.1, 9, 1.95], "cat");
machine.learn([23.5, 20, 20, 6.2], "dog");
machine.learn([16, 9.0, 10, 2.1], "cat");
machine.learn([16, 9.0, 10, 2.1], "dog");

// maak een voorspelling

function submitForm(e) {
    let height  = parseInt(document.getElementById('height').value);
    let weight  = parseInt(document.getElementById('weight').value);
    let length  = parseInt(document.getElementById('length').value);
    let ear     = parseInt(document.getElementById('ear').value);

    let prediction = machine.classify([length, height, weight, ear]);

    if (prediction == 'cat') {
        result.src = './cat.png';
    } else if (prediction == 'dog') {
        result.src = './dog.jpg';
    } else {
        return;
    }
}
