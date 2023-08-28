/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { fromEvent, interval, merge } from "rxjs";
import { filter, map, scan } from "rxjs/operators";

/** Constants */

const Viewport = {
  CANVAS_WIDTH: 200,
  CANVAS_HEIGHT: 400,
  PREVIEW_WIDTH: 160,
  PREVIEW_HEIGHT: 80,
} as const;

const Constants = {
  TICK_RATE_MS: 500,
  GRID_WIDTH: 10,
  GRID_HEIGHT: 20,
} as const;

const Block = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

/** Type Definitions */
type Grid = "EMPTY" | "FILLED";
type Board = ReadonlyArray<ReadonlyArray<Grid>>;
type Tetromino = ReadonlyArray<ReadonlyArray<Grid>>;

/** User input */

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */
const initialiseBoard = (): Board =>
  Array.from({ length: Constants.GRID_HEIGHT }, () =>
    Array.from({ length: Constants.GRID_WIDTH }, () => "EMPTY")
  );

const O_Tetromino: Tetromino = [
  // 2x2 tetromino
  ["FILLED", "FILLED"],
  ["FILLED", "FILLED"],
];

const I_Tetromino: Tetromino = [["FILLED", "FILLED", "FILLED", "FILLED"]];

const J_Tetromino: Tetromino = [
  ["EMPTY", "FILLED"],
  ["EMPTY", "FILLED"],
  ["FILLED", "FILLED"],
];

const L_Tetromino: Tetromino = [
  ["FILLED", "EMPTY"],
  ["FILLED", "EMPTY"],
  ["FILLED", "FILLED"],
];

const S_Tetromino: Tetromino = [
  ["EMPTY", "FILLED", "FILLED"],
  ["FILLED", "FILLED", "EMPTY"],
];

const T_Tetromino: Tetromino = [
  ["FILLED", "FILLED", "FILLED"],
  ["EMPTY", "FILLED", "EMPTY"],
];

const Z_Tetromino: Tetromino = [
  ["FILLED", "FILLED", "EMPTY"],
  ["EMPTY", "FILLED", "FILLED"],
];

const tetrominos: Tetromino[] = [
  O_Tetromino,
  I_Tetromino,
  J_Tetromino,
  L_Tetromino,
  S_Tetromino,
  T_Tetromino,
  Z_Tetromino,
];

const randomTetromino = (): Tetromino => {
  return tetrominos[Math.floor(Math.random() * tetrominos.length)];
};

const createTetromino = (): Tetromino => {
  return randomTetromino(); // Choose a random Tetris shape
};

const isCollision = (
  board: Board,
  tetromino: Tetromino,
  x: number,
  y: number
): boolean => {
  return tetromino.some((row, i) =>
    row.some(
      (cell, j) =>
        cell === "FILLED" && (board[y + i] && board[y + i][x + j]) !== "EMPTY"
    )
  );
};

const tetrominoToBoard = (
  board: Board,
  tetromino: Tetromino,
  x: number,
  y: number
): Board => {
  return board.map((row, i) => {
    return row.map((cell, j) => {
      if (
        i >= y &&
        i < y + tetromino.length &&
        j >= x &&
        j < x + tetromino[0].length
      ) {
        return tetromino[i - y][j - x] === "FILLED" ? "FILLED" : cell;
      }
      return cell;
    });
  });
};

/**
 * Checks if a row is fully filled
 * @param row Row to check
 */
const isRowFilled = (row: ReadonlyArray<Grid>): boolean =>
  row.every((cell) => cell === "FILLED");

/**
 * Clears filled rows from the board and returns a new board
 * @param board Current board state
 */
const clearRows = (board: Board): { newBoard: Board; clearedRows: number } => {
  const clearedBoard = board.filter((row) => !isRowFilled(row));
  const clearedRows = Constants.GRID_HEIGHT - clearedBoard.length;
  const emptyRows: Board = Array.from({ length: clearedRows }, () =>
    Array.from({ length: Constants.GRID_WIDTH }, () => "EMPTY")
  );
  return { newBoard: [...emptyRows, ...clearedBoard], clearedRows };
};

/** State processing */

type State = Readonly<{
  board: Board;
  currTetromino: Tetromino;
  nextTetromino: Tetromino;
  tetrominoX: number;
  tetrominoY: number;
  rotate: number;
  level: number;
  score: number;
  gameEnd: boolean;
}>;

const initialState: State = {
  board: initialiseBoard(),
  currTetromino: createTetromino(),
  nextTetromino: createTetromino(),
  tetrominoX: Math.floor(Constants.GRID_WIDTH / 2),
  tetrominoY: 0,
  rotate: 0,
  level: 1,
  score: 0,
  gameEnd: false,
} as const;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State): State => {
  // logic for moving tetromino down and checking for collision
  // If collision is detected at the starting position, trigger game over
  if (
    s.tetrominoY === 0 &&
    isCollision(s.board, s.currTetromino, s.tetrominoX, s.tetrominoY)
  ) {
    return {
      ...s,
      gameEnd: true,
      // You might also want to display a "Game Over" message or perform other actions here
    };
  }

  // If collision is detected, place tetromino on board
  if (isCollision(s.board, s.currTetromino, s.tetrominoX, s.tetrominoY + 1)) {
    const newBoard = tetrominoToBoard(
      s.board,
      s.currTetromino,
      s.tetrominoX,
      s.tetrominoY
    );
    // place tetromino on board and generate new tetromino

    const { newBoard: clearedBoard, clearedRows } = clearRows(newBoard);
    const newScore = s.score + clearedRows * 100;

    // Check if the new tetromino intersects with existing blocks at the starting position
    const gameEnd = isCollision(
      clearedBoard,
      s.nextTetromino,
      Math.floor(Constants.GRID_WIDTH / 2) - 1,
      0
    );
    // TODO: implement row clearing when a row is fully filled

    return {
      ...s,
      board: clearedBoard, // newBoard
      currTetromino: s.nextTetromino,
      nextTetromino: createTetromino(),
      tetrominoX: Math.floor(Constants.GRID_WIDTH / 2) - 1,
      tetrominoY: 0,
      score: newScore,
      gameEnd,
    };
  }

  // If no collision, move tetromino down
  return {
    ...s,
    tetrominoY: s.tetrominoY + 1,
  };
};

/** Rendering (side effects) */

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const container = document.querySelector("#main") as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** User input */

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: Key) =>
    key$.pipe(filter(({ code }) => code === keyCode));

  const left$ = fromKey("KeyA");
  const right$ = fromKey("KeyD");
  const down$ = fromKey("KeyS");

  /** Observables */

  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS);

  const moveTetromino = (s: State, moveX: number, moveY: number): State => {
    const newX = Math.max(
      0,
      Math.min(
        Constants.GRID_WIDTH - s.currTetromino[0].length,
        s.tetrominoX + moveX
      )
    );

    return {
      ...s,
      tetrominoX: newX,
      tetrominoY: s.tetrominoY + moveY,
    };
  };

  const updateStateAfterLanding = (s: State): State => {
    const newBoard = tetrominoToBoard(
      s.board,
      s.currTetromino,
      s.tetrominoX,
      s.tetrominoY
    );

    const newTetromino = createTetromino();
    const newTetrominoX = Math.floor(Constants.GRID_WIDTH / 2) - 1;

    return {
      ...s,
      board: newBoard,
      currTetromino: newTetromino,
      tetrominoX: newTetrominoX,
      tetrominoY: 0,
    };
  };

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    // Clear previous state
    Array.from(svg.childNodes).forEach((child) => svg.removeChild(child));
    Array.from(preview.childNodes).forEach((child) =>
      preview.removeChild(child)
    );

    scoreText.innerHTML = `${s.score}`;
    if (s.gameEnd) {
      gameover.style.display = "block";
      return;
    }

    // Add blocks to the preview canvas for the next Tetromino
    s.nextTetromino.map((row, y) =>
      row.map((cell, x) => {
        if (cell === "FILLED") {
          const cube = createSvgElement(preview.namespaceURI, "rect", {
            height: `${Block.HEIGHT}`,
            width: `${Block.WIDTH}`,
            x: `${Block.WIDTH * x}`,
            y: `${Block.HEIGHT * y}`,
            style: "fill: blue",
          });
          preview.appendChild(cube);
        }
      })
    );

    // Add blocks to the main grid canvas
    Array.from({ length: Constants.GRID_HEIGHT }, (_, y) =>
      Array.from(
        { length: Constants.GRID_WIDTH },
        (_, x) =>
          s.board[y][x] === "FILLED" ||
          (x >= s.tetrominoX &&
            x < s.tetrominoX + s.currTetromino[0].length &&
            y >= s.tetrominoY &&
            y < s.tetrominoY + s.currTetromino.length)
      ).map((shouldFill, x) => {
        if (shouldFill) {
          const cube = createSvgElement(svg.namespaceURI, "rect", {
            height: `${Block.HEIGHT}`,
            width: `${Block.WIDTH}`,
            x: `${Block.WIDTH * x}`,
            y: `${Block.HEIGHT * y}`,
            style: "fill: green",
          });
          svg.appendChild(cube);
        }
      })
    );
  };
  // svg.appendChild(cube);
  // const cube2 = createSvgElement(svg.namespaceURI, "rect", {
  //   height: `${Block.HEIGHT}`,
  //   width: `${Block.WIDTH}`,
  //   x: `${Block.WIDTH * (3 - 1)}`,
  //   y: `${Block.HEIGHT * (20 - 1)}`,
  //   style: "fill: red",
  // });
  // svg.appendChild(cube2);
  // const cube3 = createSvgElement(svg.namespaceURI, "rect", {
  //   height: `${Block.HEIGHT}`,
  //   width: `${Block.WIDTH}`,
  //   x: `${Block.WIDTH * (4 - 1)}`,
  //   y: `${Block.HEIGHT * (20 - 1)}`,
  //   style: "fill: red",
  // });
  // svg.appendChild(cube3);

  // Add a block to the preview canvas
  //   const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
  //     height: `${Block.HEIGHT}`,
  //     width: `${Block.WIDTH}`,
  //     x: `${Block.WIDTH * 2}`,
  //     y: `${Block.HEIGHT}`,
  //     style: "fill: green",
  //   });
  //   preview.appendChild(cubePreview);
  // };

  /** Determines the rate of time steps */
  const source$ = merge(
    tick$.pipe(map(() => tick)),
    left$.pipe(map(() => (s: State) => moveTetromino(s, -1, 0))),
    right$.pipe(map(() => (s: State) => moveTetromino(s, 1, 0))),
    down$.pipe(map(() => tick))
  )
    .pipe(
      scan((s: State, action: (s: State) => State) => {
        return action(s);
      }, initialState)
    )
    .subscribe((s: State) => {
      render(s);

      if (s.gameEnd) {
        show(gameover);
      } else {
        hide(gameover);
      }
    });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
