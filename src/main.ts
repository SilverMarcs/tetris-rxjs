import "./style.css";

import { BehaviorSubject, Observable, fromEvent, interval, merge } from "rxjs";
import {
  filter,
  map,
  repeat,
  scan,
  switchMap,
  takeWhile,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { Constants, Viewport } from "./constants";
import { gameActions, initialState } from "./game";
import { getTickSpeed } from "./generics";
import { Key, Movement, State } from "./types";
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

  const hold$: Observable<Movement> = key$.pipe(
    fromKey("KeyH"),
    map((_) => "Hold")
  );

  // Create a stream of movements
  const movements$ = merge(left$, right$, rotate$, hold$);

  // Initialize highScore and score as a BehaviorSubject since we need to extract these values from the state
  const highScore$ = new BehaviorSubject(0);
  const score$ = new BehaviorSubject(0);

  // Create a stream of ticks and its speed based on the score
  const tick$ = score$.pipe(
    switchMap((score) => interval(getTickSpeed(score))),
    map(() => "Down" as Movement)
  );

  // const events$ = merge(movements$, tick$);

  const game$ = merge(movements$, tick$).pipe(
    scan(
      (state: State, event: Movement) => gameActions[event](state),
      initialState
    ),
    tap((state: State) => {
      if (state.gameEnd && state.score > highScore$.value) {
        highScore$.next(state.score);
      }
      score$.next(state.score);
    }),
    takeWhile((state: State) => !state.gameEnd, true),
    repeat({ delay: 3000 }), // delay before the game over screen disappears
    withLatestFrom(highScore$, (state, highScore) => ({ ...state, highScore }))
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
