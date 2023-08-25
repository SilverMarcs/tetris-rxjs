import { Cube } from "./constants";
import { BlockPosition, CubePosition, State } from "./types";

export const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

const createCube =
  (svg: SVGElement, color: string) => (cubePos: CubePosition) => {
    const cube = createSvgElement(svg.namespaceURI, "rect", {
      height: `${Cube.HEIGHT}`,
      width: `${Cube.WIDTH}`,
      x: `${Cube.WIDTH * cubePos.x}`,
      y: `${Cube.HEIGHT * cubePos.y}`,
      style: `fill: ${color}`,
    });
    svg.appendChild(cube);
  };

function createGameOverElement(svg: SVGElement) {
  const gameOverBox = createSvgElement(svg.namespaceURI, "rect", {
    x: "26",
    y: "120",
    fill: "white",
    height: "48",
    width: "149",
  });
  svg.appendChild(gameOverBox);

  const gameOverText = createSvgElement(svg.namespaceURI, "text", {
    x: "36",
    y: "150",
  });
  gameOverText.textContent = "Game Over";
  svg.appendChild(gameOverText);
}

export const renderBlock = (block: BlockPosition, svg: SVGElement) =>
  block.forEach(createCube(svg, "green"));

export const renderOldBlocks = (oldBlocks: BlockPosition[], svg: SVGElement) =>
  oldBlocks.flat().forEach(createCube(svg, "red"));

export const renderPreview = (block: BlockPosition, preview: SVGElement) => {
  while (preview.firstChild) preview.firstChild.remove();
  block.forEach(createCube(preview, "green"));
};

export const render = (
  { gameEnd, currentBlock, nextBlock, oldBlocks, score }: State,
  svg: SVGElement,
  scoreElement: HTMLElement,
  highScoreElement: HTMLElement,
  highScore: number,
  preview?: SVGElement
) => {
  while (svg.firstChild) svg.firstChild.remove();

  scoreElement.textContent = `${score}`;

  highScoreElement.textContent = `${highScore}`;

  currentBlock && renderBlock(currentBlock, svg);

  nextBlock && renderPreview(nextBlock, preview!);

  renderOldBlocks(oldBlocks, svg);

  gameEnd && createGameOverElement(svg);
};
