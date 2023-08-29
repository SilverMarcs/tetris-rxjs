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

const createGameOverElement = (svg: SVGElement) => {
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
};

export const renderBlock = (block: BlockPosition, svg: SVGElement) =>
  block.map(createCube(svg, "green"));

export const renderOldBlocks = (oldBlocks: BlockPosition[], svg: SVGElement) =>
  oldBlocks.flatMap((block) => block).forEach(createCube(svg, "green"));

export const renderPreview = (block: BlockPosition, preview: SVGElement) => {
  while (preview.firstChild) preview.firstChild.remove();

  // we take relative position of each cube in the block since we want to render the block in the middle of the preview
  // this is not by default as the positions are actually the random x and y positions from the block generator
  const minX = Math.min(...block.map((pos) => pos.x));
  const minY = Math.min(...block.map((pos) => pos.y));

  const relativeBlock = block.map(({ x, y }) => ({
    x: x - minX + 3,
    y: y - minY + 1,
  }));

  relativeBlock.map(createCube(preview, "brown"));
};

export const render = (
  { gameEnd, currentBlock, nextBlock, oldBlocks, score, highScore }: State,
  svg: SVGElement,
  scoreElement: HTMLElement,
  highScoreElement: HTMLElement,
  preview?: SVGElement
) => {
  while (svg.firstChild) svg.firstChild.remove();

  scoreElement.textContent = `${score}`;

  highScoreElement.textContent = `${highScore > score ? highScore : score}`;

  currentBlock && renderBlock(currentBlock, svg);

  nextBlock && renderPreview(nextBlock, preview!);

  renderOldBlocks(oldBlocks, svg);

  gameEnd && createGameOverElement(svg);
};
