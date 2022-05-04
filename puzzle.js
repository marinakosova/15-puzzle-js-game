class Puzzle {
    constructor(size) {
        this.size = this.size || 4;
        this.items = [];
        this.timer = new Date(0, 0, 0, 0, 0);
        this.moves = 0;
        this.movesCallback = (moves) => {}
        this.timerCallback = (time) => {}

        const tickTimer = () => {
            this.timer.setSeconds(this.timer.getSeconds() + 1);
            this.timerId = setTimeout(tickTimer, 1000);
            this.timerCallback(this.timer);
        }
        this.timerId = setTimeout(tickTimer, 1000);

        //create matrix
        let num = 1;

        for (let i = 0; i < this.size; i++) {
            this.items[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.items[i][j] = num;
                num++;
            }
        }
        //16-th item is null
        this.items[this.size - 1][this.size - 1] = null;
    }

    move(number) {
        let directions = [
            [0, 1], // down
            [1, 0],
            [0, -1],
            [-1, 0]
        ];
        let row, col;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.items[i][j] == number) {
                    row = i;
                    col = j;
                }
            }
        }

        for (let i = 0; i < 4; i++) {
            let newCol = col + directions[i][0];
            let newRow = row + directions[i][1];
            console.log(`${newCol} ${newRow}`);

            if (newCol >= 0 &&
                newRow >= 0 &&
                newCol < this.size &&
                newRow < this.size &&
                this.items[newRow][newCol] == null) {
                swap(this.items, row, col, newRow, newCol);

                this.moves++;

                //check for null
                this.movesCallback && this.movesCallback(this.moves);
                return true;
            }
        }
        return false;

        function swap(items, row1, col1, row2, col2) {
            let tmp = items[row1][col1];
            items[row1][col1] = items[row2][col2];
            items[row2][col2] = tmp;
        }
    }

    get numbers() {
        let copy = [];
        for (let i = 0; i < this.size; i++) {
            copy.push([...this.items[i]]);
        }
        return copy;
    }

    shuffle() {
        for (let i = 0; i < 1000; i++) {
            let n = Math.floor(Math.random() * (this.size * this.size - 1)) + 1;
            this.move(n);
        }

        this.moves = 0;
    }

    checkWin() {
        let count = 1;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (i == this.size - 1 && j == this.size - 1) {
                    if (this.items[i][j] != null) return false;
                } else {
                    if (this.items[i][j] !== count)
                        return false;
                }
                count++;
            }
        }
        return true;
    }

    static save(puzzle) {
        let data = {
            size: puzzle.size,
            items: puzzle.items,
            moves: puzzle.moves,
            time: puzzle.timer
        }
        localStorage.setItem("game", JSON.stringify(data));
    }

    static load() {
        let data = JSON.parse(localStorage.getItem("game"));
        if (!data) return null;

        let puzzle = new Puzzle(data.size);
        puzzle.items = data.items;
        puzzle.moves = data.moves;
        puzzle.timer = new Date(data.time);

        return puzzle;
    }

    static clearStorage() {
        localStorage.removeItem("game");
    }
}