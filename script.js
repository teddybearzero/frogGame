// Define the Box class representing the puzzle box
class Box {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Methods to get neighboring boxes
  getTopBox() {
    if (this.y === 0) return null;
    return new Box(this.x, this.y - 1);
  }

  getRightBox() {
    if (this.x === 3) return null;
    return new Box(this.x + 1, this.y);
  }

  getBottomBox() {
    if (this.y === 3) return null;
    return new Box(this.x, this.y + 1);
  }

  getLeftBox() {
    if (this.x === 0) return null;
    return new Box(this.x - 1, this.y);
  }

  // Method to get all neighboring boxes
  getNextdoorBoxes() {
    return [
      this.getTopBox(),
      this.getRightBox(),
      this.getBottomBox(),
      this.getLeftBox()
    ].filter(box => box !== null);
  }

  // Method to get a random neighboring box
  getRandomNextdoorBox() {
    const nextdoorBoxes = this.getNextdoorBoxes();
    return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
  }
}

// Function to swap boxes in the grid
const swapBoxes = (grid, box1, box2) => {
  const temp = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp;
};

// Function to check if the puzzle is solved
const isSolved = grid => {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] !== i * grid.length + j) {
        return false;
      }
    }
  }
  return true;
};

// Function to generate a random grid
const getRandomGrid = () => {
  let grid = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]];

  // Shuffle the grid
  let blankBox = new Box(3, 3);
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox();
    swapBoxes(grid, blankBox, randomNextdoorBox);
    blankBox = randomNextdoorBox;
  }

  // If the shuffled grid is already solved, generate a new one
  if (isSolved(grid)) return getRandomGrid();
  return grid;
};

// Define the State class representing the game state
class State {
  constructor(grid, move, time, status) {
    this.grid = grid;
    this.move = move;
    this.time = time;
    this.status = status;
  }

  // Static method to create the initial "ready" state
  static ready() {
    return new State(
      [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]],
      0,
      0,
      "ready"
    );
  }

  // Static method to create the starting "playing" state
  static start() {
    return new State(getRandomGrid(), 0, 0, "playing");
  }
}

// Define the Game class representing the game logic and UI
class Game {
  constructor(state) {
    this.state = state;
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    this.handleClickBox = this.handleClickBox.bind(this);
  }

  // Static method to create a game in the ready state
  static ready() {
    return new Game(State.ready());
  }

  // Method to update the state with the passage of time
  tick() {
    this.setState({ time: this.state.time + 1 });
  }

  // Method to set a new state and trigger a re-render
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  // Method to handle click events on puzzle boxes
  handleClickBox(box) {
    return function() {
      const nextdoorBoxes = box.getNextdoorBoxes();
      const blankBox = nextdoorBoxes.find(
        nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 15
      );
      if (blankBox) {
        const newGrid = [...this.state.grid];
        swapBoxes(newGrid, box, blankBox);
        if (isSolved(newGrid)) {
          clearInterval(this.tickId);
          this.setState({
            status: "won",
            grid: newGrid,
            move: this.state.move + 1
          });
        } else {
          this.setState({
            grid: newGrid,
            move: this.state.move + 1
          });
        }
      }
    }.bind(this);
  }

  // Method to render the game UI
  render() {
    const { grid, move, time, status } = this.state;

    // Render puzzle grid
    const newGrid = document.createElement("div");
  newGrid.className = "grid";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const pieceNumber = grid[i][j];
      if (pieceNumber !== 15) {
        const img = new Image();
        img.src = `images/${pieceNumber}.png`;
        img.alt = `Piece ${pieceNumber}`;
        img.className = "piece"; // Added the "piece" class for styling
        img.addEventListener("click", this.handleClickBox(new Box(j, i)));
        newGrid.appendChild(img);
      } else {
        const emptyPiece = document.createElement("div");
        emptyPiece.className = "piece empty";
        emptyPiece.textContent = "15"; // Display the number for the empty piece
        newGrid.appendChild(emptyPiece);
      }
    }
  }
  const oldGrid = document.querySelector(".grid");
  if (oldGrid) {
    oldGrid.replaceWith(newGrid);
  } else {
    document.querySelector(".game").appendChild(newGrid);
  }

    // Render play/reset button
    const newButton = document.createElement("button");
    if (status === "ready") newButton.textContent = "Play";
    if (status === "playing") newButton.textContent = "Reset";
    if (status === "won") newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      clearInterval(this.tickId);
      this.tickId = setInterval(this.tick, 1000);
      this.setState(State.start());
    });
    document.querySelector(".footer button").replaceWith(newButton);

    // Render move count
    document.getElementById("move").textContent = `Move: ${move}`;

    // Render time
    document.getElementById("time").textContent = `Time: ${time}`;

    // Render message
    if (status === "won") {
      document.querySelector(".message").textContent = "You win!";
    } else {
      document.querySelector(".message").textContent = "";
    }
  }
}

// Initialize the game
const GAME = Game.ready();
