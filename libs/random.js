function rollDice(){
    var max = 6;
    var min = 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function guessMyAge(){
    var max = 100;
    var min = 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTenLetterString(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i=0; i<10; i++){
        text += possible.charAt(Math.floor(Math.random()*possible.length));
    }

    return text;
}

var exports = { // object with function ensureSignedIn in it
    rollDice: rollDice,
    guessMyAge: guessMyAge,
    randomTenLetterString: randomTenLetterString,
};

module.exports = exports;