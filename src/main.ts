import "./style.css";

import { Observable, fromEvent, interval, merge, of } from "rxjs";
import { delay, expand, filter, first, map } from "rxjs/operators";
import { Viewport } from "./constants";
import { moveBlockLeft, moveBlockRight, rotateCurrentBlock } from "./generics";
import { initialState, tick } from "./state";
import { BlockPosition, Key, Movement, State } from "./types";
import { render } from "./view";

/**
 * Main function to initialize and run the game.
 */
export function main() {
  // Get references to the SVG elements and score elements in the DOM
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const scoreElement = document.getElementById("scoreText") as HTMLElement;
  const highScoreElement = document.getElementById(
    "highScoreText"
  ) as HTMLElement;

  // Set the height and width attributes of the SVG elements
  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Create an observable for keydown events
  const key$ = fromEvent<KeyboardEvent>(document, "keydown");

  // Function to filter keydown events by key code
  const fromKey = (keyCode: Key) =>
    filter((e: KeyboardEvent) => e.code === keyCode);

  // Create observables for left, right, and rotate movements based on keydown events
  const left$: Observable<Movement> = key$.pipe(
    fromKey("KeyA"),
    map((_) => "Left")
  );
  const right$: Observable<Movement> = key$.pipe(
    fromKey("KeyD"),
    map((_) => "Right")
  );

  const rotate$: Observable<Movement> = key$.pipe(
    fromKey("Enter"),
    map((_) => "Rotate")
  );

  // Merge the movement observables into a single observable
  const movement$ = merge(left$, right$, rotate$).pipe(
    map((movement): Movement => movement)
  );

  // Function to create a game action based on a movement action
  const createGameAction = (
    action: (
      currentBlock: BlockPosition | undefined,
      oldBlocks: BlockPosition[],
      gameEnd: boolean
    ) => BlockPosition | undefined
  ) => {
    return (s: State): State => {
      const newBlock = action(s.currentBlock, s.oldBlocks, s.gameEnd);
      return newBlock ? { ...s, currentBlock: newBlock } : s;
    };
  };

  // Map of game actions for each possible movement
  const gameActions: { [key in Movement]: (s: State) => State } = {
    Left: createGameAction(moveBlockLeft),
    Right: createGameAction(moveBlockRight),
    Rotate: createGameAction(rotateCurrentBlock),
    Down: (s: State) => tick(s),
  };

  // Create an observable for the game state
  const game$ = of(initialState).pipe(
    expand((s: State) => {
      if (s.gameEnd) {
        const highScore = Math.max(s.score, s.highScore);
        return of({ ...initialState, highScore }).pipe(delay(3000));
      } else {
        const tick$ = interval(s.tickRate).pipe(map(() => "Down" as Movement)); // casting is safe here because we know "Down" is a Movement

        return merge(tick$, movement$).pipe(
          first(),
          map((event: Movement) => gameActions[event](s))
        );
      }
    })
  );

  // Subscribe to the game observable and render the game state for each new state
  game$.subscribe((s: State) => {
    render(s, svg, scoreElement, highScoreElement, preview);
  });
}

if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
