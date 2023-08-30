import "./style.css";

import { Viewport } from "./constants";
import { game$, score$ } from "./observables";
import { State } from "./types";
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

  // Subscribe to the game observable and render the game state for each new state
  game$.subscribe((s: State) => {
    render(s, svg, scoreElement, highScoreElement, preview);
    score$.next(s.score); // update the score value of the score$ observable with the latest score
  });
}

if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
