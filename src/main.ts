import "./style.css";

import { Observable, fromEvent, interval, merge, of } from "rxjs";
import { delay, expand, filter, first, map } from "rxjs/operators";
import { Viewport } from "./constants";
import { moveBlockLeft, moveBlockRight, rotateCurrentBlock } from "./generics";
import { initialState, tick } from "./state";
import { BlockPosition, Key, Movement, State } from "./types";
import { render } from "./view";

export function main() {
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const scoreElement = document.getElementById("scoreText") as HTMLElement;
  const highScoreElement = document.getElementById(
    "highScoreText"
  ) as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  const key$ = fromEvent<KeyboardEvent>(document, "keydown");

  const fromKey = (keyCode: Key) =>
    filter((e: KeyboardEvent) => e.code === keyCode);

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

  const movement$ = merge(left$, right$, rotate$).pipe(
    map((movement): Movement => movement)
  );

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

  const gameActions: { [key in Movement]: (s: State) => State } = {
    Left: createGameAction(moveBlockLeft),
    Right: createGameAction(moveBlockRight),
    Rotate: createGameAction(rotateCurrentBlock),
    Down: (s: State) => tick(s),
  };

  const game$ = of(initialState).pipe(
    expand((s: State) => {
      if (s.gameEnd) {
        const highScore = Math.max(s.score, s.highScore);
        return of({ ...initialState, highScore }).pipe(delay(3000));
      } else {
        const tick$ = interval(s.tickRate).pipe(map(() => "Down" as Movement)); // casting is safe here becasue we know "Down" is a Movement

        return merge(tick$, movement$).pipe(
          first(),
          map((event: Movement) => gameActions[event](s))
        );
      }
    })
  );

  game$.subscribe((s: State) => {
    render(s, svg, scoreElement, highScoreElement, preview);
  });
}

if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
