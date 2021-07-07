const p1Style = document.querySelector(".p1");
const p2Style = document.querySelector(".p2");
const tieStyle = document.querySelector(".tie");
const allButtons = document.querySelectorAll("input[type=radio]");
const start = document.getElementById('startGame');
const cells = document.querySelectorAll('.cell');

var originalBoard;
var pturn;

var isHumanTurn = true;

var score1 = 0;
var score2 = 0;
var scoreTie = 0

const player1 = {
    character: 'O',
    playerType: '',
    level: null,
    p: 'player1',
    turn: 1
}
const player2 = {
    character: 'X',
    playerType: '',
    level: null,
    p: 'player2',
    turn: -1
}

const winCombos = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [6,4,2]
]



async function startGame(){
    // player turn for human vs human
    pturn = 1;

    disableGameFunctions();

    //fill originalBoard with 0s
    originalBoard = Array.from(Array(9).keys());

    setGameSetting();

    removeScoreColor();

    p1Style.classList.add('turn-color');

    changePlayerDisplay();
    

    for (var i = 0; i < cells.length; i++){
        isHumanTurn = true;
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', gameMode, false);
    }

    // computer plays first
    if (player1.playerType == 'computerPlayer'){
        await aiMove(player1, player2);
        if (player2.playerType == 'computerPlayer'){
             Computer_vs_Computer(player1, player2);
        }
    }
}
    

function setGameSetting(){
    var p1Type = document.getElementsByName('player-1');
    var p1Difficulty = document.getElementsByName('p1-level');

    var p2Type = document.getElementsByName('player-2');
    var p2Difficulty = document.getElementsByName('p2-level');

    setPlayerSetting(player1, p1Type, p1Difficulty);
    setPlayerSetting(player2, p2Type, p2Difficulty);
}


function setPlayerSetting(player, playerType, difficulty_level){
    for (var i = 0; i < playerType.length; i++){
        if (playerType[i].checked == true){
            player.playerType = playerType[i].id;
        }
    }

    if (player.playerType == 'computerPlayer'){
        for (var i = 0; i < difficulty_level.length; i++){
            if (difficulty_level[i].checked == true){
                player.level = difficulty_level[i].id;
            }
        }
    } 
    else {
        player.level = null
    }
}

function gameMode(square){

    if (player1.playerType == 'humanPlayer' && player2.playerType == 'humanPlayer'){
        Human_vs_Human(player1, player2, square);
    }

    if (player1.playerType == 'humanPlayer' && player2.playerType == 'computerPlayer'){
        Human_vs_Computer(player1, player2, square);
    }

    if (player1.playerType == 'computerPlayer' && player2.playerType == 'humanPlayer'){
        Human_vs_Computer(player2, player1, square);
    }

}

function Human_vs_Human(p1, p2, square){
    if (pturn == 1) {
        if (typeof originalBoard[square.target.id] == 'number'){
            placeMove(square.target.id, p1);
            setPlayer2Color();
        }
    }

    if (pturn == -1){
        if (typeof originalBoard[square.target.id] == 'number'){
            placeMove(square.target.id, p2);
            setPlayer1Color();
        }
    }
    pturn = -1 * pturn;
}

async function Human_vs_Computer(p1, p2, square){

    if (!isHumanTurn) return;
    if (typeof originalBoard[square.target.id] == 'number'){

        (p1.p == 'player1') ? setPlayer2Color() : setPlayer1Color(); 

        placeMove(square.target.id, p1);
        isHumanTurn = false;
        await aiMove(p2, p1);
        isHumanTurn = true;
    }
}

async function Computer_vs_Computer(p1, p2){
    for (var i = 0; i < 4; i++){
        if (await aiMove(p2, p1)) break;
        if (await aiMove(p1, p2)) break;
    }
}

function aiMove(currentPlayer, opponentPlayer){
    if (!checkWin(originalBoard, opponentPlayer) && !checkTie()){
        // (currentPlayer.p == 'player1') ? p2Style.classList.add('active') :  p1Style.classList.remove('active');

        return new Promise((resolve) => {
            setTimeout(()=>{
                (currentPlayer.p == 'player1') ? setPlayer2Color() : setPlayer1Color(); 
                placeMove(difficulty_level(currentPlayer, opponentPlayer), currentPlayer);
            }, 800);

            setTimeout(resolve, 800);
        });
    } 
    else{
        return true;
    }
}

function placeMove(squareId, currentPlayer){
    originalBoard[squareId] = currentPlayer.character;
    document.getElementById(squareId).innerText = currentPlayer.character;

    let gameWon = checkWin(originalBoard, currentPlayer);

    if (gameWon){
        removeScoreColor();
        updatePlayerWin(gameWon);
    } 
    else if (checkTie()){
        removeScoreColor();
        updateTieScore()
    }
}

function difficulty_level(currentPlayer, opponenetPlayer){
    if (currentPlayer.level == 1){
        return botLevel_1();
    }
    else if (currentPlayer.level == 2){
        return botLevel_2();
    }
    else if (currentPlayer.level == 3){
        return botLevel_3(originalBoard, currentPlayer.character,  currentPlayer, opponenetPlayer).index;
    }
}


function botLevel_1(){
    return emptySquares()[0];
}

function botLevel_2(){
    var index = randomizeMove(emptySquares());
    return emptySquares()[index];
}


// minimax player
function botLevel_3(newBoard, player, currentPlayer, opponentPlayer){
    var availSpots = emptySquares(newBoard);

    if (checkWin(newBoard, opponentPlayer)){
        return {score: -10};
    }
    else if (checkWin(newBoard, currentPlayer)){
        return {score : 10};
    }
    else if(availSpots.length === 0){
        return {score: 0};
    }

    var moves = [];
    while (availSpots.length != 0){
        var currentMove = {};

        var randMove = randomizeMove(availSpots);
        var index = availSpots.splice(randMove, 1);

        currentMove.index = newBoard[index];
        newBoard[index] = player;

        if (player == currentPlayer.character){
              var result = botLevel_3(newBoard, opponentPlayer.character,  currentPlayer, opponentPlayer);
              currentMove.score = result.score;
        } 

        else {
            var result = botLevel_3(newBoard, currentPlayer.character, currentPlayer, opponentPlayer);
            currentMove.score = result.score;
        }

        newBoard[index] = currentMove.index;
        moves.push(currentMove);

    }

    // maximize
    var bestMove;
    if (player == currentPlayer.character){
        var bestScore = -10000;
        for (var i = 0; i < moves.length; i++){
            if (moves[i].score > bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    //minimize
    else {
        var bestScore = 10000;
        for (var i = 0; i < moves.length; i++){
            if (moves[i].score < bestScore){
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}


function checkTie(){
    return (emptySquares().length == 0);
}

function checkWin(board, player){
    let plays = board.reduce((a,e,i) =>
        (e === player.character) ? a.concat(i) : a, []);

    let gameWon = null;
    for (let [index, win] of winCombos.entries()){
        if (win.every(elem => plays.indexOf(elem) > -1)){
            gameWon = {index: index, player: player.character};
            break;
        }
    }
    return gameWon;
}

function updatePlayerWin(gameWon){
    for (let index of winCombos[gameWon.index]){
        document.getElementById(index).style.backgroundColor = "red";
    }

    for (var i = 0; i < cells.length; i++){
        cells[i].removeEventListener('click', gameMode, false);
    }

    removeScoreColor();

    if (gameWon.player == 'O') {
        score1++;
        p1Style.classList.add('turn-color');
        document.getElementById('score1').textContent = score1;
    }
    else {
        score2++;
        p2Style.classList.add('turn-color');
        document.getElementById('score2').textContent = score2;
    } 
}

function updateTieScore(){
    for (var i = 0; i < cells.length; i++){
        cells[i].style.backgroundColor = "green";
        cells[i].removeEventListener('click', gameMode, false);
    }
    scoreTie++;
    document.getElementById('score-tie').textContent = scoreTie;
    tieStyle.classList.add('tie-color');
}

function emptySquares(){
    return originalBoard.filter(s => typeof s == 'number');
}

function randomizeMove(arr){
    var max = arr.length - 1;
    return Math.floor(Math.random() * (max - 0) + 0);
}

function disableGameFunctions(){
    allButtons.forEach((btn) => {
        btn.disabled = true;
    });

    start.textContent = 'Replay';
    start.style.background = '#bbb';
}

function setPlayer2Color(){
    p1Style.classList.remove('turn-color');
    p2Style.classList.add('turn-color');
}

function setPlayer1Color(){
    p2Style.classList.remove('turn-color');
    p1Style.classList.add('turn-color');
}

function removeScoreColor(){
    if (p1Style.classList.contains('turn-color')) p1Style.classList.remove('turn-color');
    if (p2Style.classList.contains('turn-color')) p2Style.classList.remove('turn-color');
    if (tieStyle.classList.contains('tie-color')) tieStyle.classList.remove('tie-color');
}

function changePlayerDisplay(){
    (player1.playerType == 'humanPlayer') ?   p1Style.textContent = 'Human 1(O)' 
                                            : p1Style.textContent = 'AI-P1(O)';

    (player2.playerType == 'humanPlayer') ?   p2Style.textContent = 'Human 2(X)' 
                                            : p2Style.textContent = 'AI-P2(X)';
}