const body = document.querySelector('body');
const audio = new Audio('assets/click.wav');

function createGameLayout(onStart, onSound, onSave) {
    let outerDiv = document.createElement("div");
    outerDiv.classList.add('game-layout');

    let puzzleSettings = document.createElement("div");
    puzzleSettings.classList.add('gem-puzzle-settings');

    let settingsButtons = document.createElement("div");
    settingsButtons.classList.add('gem-puzzle-settings_buttons');

    let startButton = document.createElement("button");
    startButton.setAttribute("type", "button");
    startButton.textContent = "Start new game";
    startButton.addEventListener('click', (e) => onStart());

    let soundButton = document.createElement("button");
    soundButton.setAttribute("type", "button");
    soundButton.classList.add("gem-puzzle-sound");
    soundButton.textContent = "Sound ";
    soundButton.classList.add("gem-puzzle--activatable");
    soundButton.addEventListener('click', (e) => onSound());

    let saveButton = document.createElement("button");
    saveButton.setAttribute("type", "button");
    saveButton.textContent = "Save game";
    saveButton.addEventListener("click", (e) => onSave());

    settingsButtons.append(startButton, soundButton, saveButton);

    let settingsScore = document.createElement("div");
    settingsScore.classList.add('gem-puzzle-settings_score');

    let movesDiv = document.createElement("div");
    let movesLabel = document.createElement("label");
    movesLabel.textContent = "Moves: ";
    let movesCounter = document.createElement("label");
    movesCounter.id = ("moves");
    movesCounter.textContent = "0";
    movesDiv.append(movesLabel, movesCounter);

    let timeDiv = document.createElement("div");
    let timeLabel = document.createElement("label");
    timeLabel.textContent = "Time: ";
    let timer = document.createElement("label");
    timer.id = ('timer');
    timer.textContent = "0";
    timeDiv.append(timeLabel, timer);

    settingsScore.append(movesDiv, timeDiv);

    puzzleSettings.append(settingsButtons, settingsScore);
    outerDiv.append(puzzleSettings);

    body.appendChild(outerDiv);

    return outerDiv;
}

function renderPuzzleBlocks(puzzleNumbers, onClickCallback) {
    let puzzleBlocks = document.createElement("div");
    puzzleBlocks.classList.add('gem-puzzle-flex');

    for (let row = 0; row < puzzleNumbers.length; row++) {
        for (let col = 0; col < puzzleNumbers[row].length; col++) {
            let blockDiv = document.createElement("div");

            //create one puzzle block button
            let blockButton = document.createElement("button");
            blockButton.classList.add("gem-puzzle-number");
            blockButton.setAttribute("type", "button");

            // is draggable now
            blockButton.setAttribute('draggable', true);

            let currentNumber = puzzleNumbers[row][col];
            blockButton.textContent = currentNumber;
            blockButton.dataset.num = currentNumber;

            let performMove = function(num) {
                    onClickCallback && onClickCallback(num);

                    if (window.sound) {
                        audio.play();
                    }
                }
                // when button clicked
            blockButton.addEventListener("click", function(e) {
                let btn = e.toElement;
                let num = Number(btn.dataset.num);
                performMove(num);
            });

            if (currentNumber == null) {
                blockDiv.classList.add('gem-puzzle-flex_empty');

                //when draggable element is dropped onto drop zone
                blockDiv.addEventListener('drop', function(e) {
                    e.preventDefault();
                    const droppedElemNum = e.dataTransfer.getData("text/plain");
                    performMove(droppedElemNum);
                });
                blockDiv.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                })
            } else if (currentNumber < 10) {
                blockDiv.classList.add('gem-puzzle-flex_button');
                blockDiv.append(blockButton);
                blockButton.addEventListener("dragstart", function(e) {
                    e.dataTransfer.setData("text/plain", currentNumber);
                });
            } else {
                blockDiv.classList.add('gem-puzzle-flex_button_wide');
                blockDiv.append(blockButton);
                blockButton.addEventListener("dragstart", function(e) {
                    e.dataTransfer.setData("text/plain", currentNumber);
                });
            }

            puzzleBlocks.append(blockDiv);
        }
    }
    return puzzleBlocks;
}


window.addEventListener("DOMContentLoaded", function() {
    const timerCallback = (time) => {
        let timeDiv = document.querySelector('#timer');
        timeDiv.textContent = formatTime(time);
    }

    const movesCallback = (move) => {
        let movesLabel = document.querySelector('#moves');
        movesLabel.textContent = move;
    }

    const winCallback = (time, moves) => {
        window.alert(`${formatTime(time)}"You won!"`);
    }

    let puzzle;

    let onStart = function(newPuzzle) {
        if (puzzle) {
            clearTimeout(puzzle.timerId);
            puzzle.timerCallback = () => {};
        }

        if (newPuzzle) {
            puzzle = newPuzzle;
        } else {
            puzzle = new Puzzle(4);
        }

        puzzle.timerCallback = timerCallback;
        puzzle.movesCallback = movesCallback;
        puzzle.winCallback = winCallback;

        movesCallback(puzzle.moves);
        timerCallback(puzzle.timer);

        render(puzzle);
    }

    let onSound = function() {
        window.sound = !window.sound;

        let soundBtn = document.querySelector(".gem-puzzle-sound");
        soundBtn.classList.toggle("gem-puzzle--active");
    }

    let onSave = function() {
        Puzzle.save(puzzle);

        alert("Your game is saved! Next time you will start from this place.");
    }

    // The crux of the start of the game
    var outerDiv = createGameLayout(onStart, onSound, onSave);

    let savedPuzzle = Puzzle.load();
    onStart(savedPuzzle);

    function render(puzzle) {
        let oldPuzzleBlockDiv = document.querySelector('.gem-puzzle-flex');
        if (oldPuzzleBlockDiv) {
            oldPuzzleBlockDiv.remove();
        }

        //puzzle blocks div
        let puzzleBlocksDiv = renderPuzzleBlocks(puzzle.numbers, function(num) {
            let result = puzzle.move(num);
            if (result) {
                puzzleBlocksDiv.remove();

                //arguments.callee - link to the current function (anonimus f)
                puzzleBlocksDiv = renderPuzzleBlocks(puzzle.numbers, arguments.callee);
                outerDiv.append(puzzleBlocksDiv);
            }
            if (puzzle.checkWin())

                alert(`You won with ${puzzle.moves} steps. Time: ${formatTime(puzzle.timer)}.`);
        });
        outerDiv.append(puzzleBlocksDiv);
    }

    function formatTime(time) {
        return `${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
    }



});