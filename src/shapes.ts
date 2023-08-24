import { Constants } from "./constants";
import { BlockPosition } from "./types";
import { randomInt } from "./util";

/**
 * Generates a random block position on the game grid.
 * @returns {BlockPosition} A block position represented as an array of {x, y} coordinates.
 */
export const generateRandomBlock = (): BlockPosition => {
  const randomX = randomInt(0, Constants.GRID_WIDTH - 4); // -4 to ensure the block fits within the grid
  const shapeType = randomInt(0, 6); // Randomly select a shape type

  switch (shapeType) {
    case 0: // I shape
      return [
        { x: randomX, y: 0 },
        { x: randomX + 1, y: 0 },
        { x: randomX + 2, y: 0 },
        { x: randomX + 3, y: 0 },
      ];
    case 1: // J shape
      return [
        { x: randomX, y: 0 },
        { x: randomX + 1, y: 0 },
        { x: randomX + 2, y: 0 },
        { x: randomX + 2, y: 1 },
      ];
    case 2: // L shape
      return [
        { x: randomX, y: 0 },
        { x: randomX + 1, y: 0 },
        { x: randomX + 2, y: 0 },
        { x: randomX, y: 1 },
      ];
    case 3: // O shape
      return [
        { x: randomX, y: 0 },
        { x: randomX + 1, y: 0 },
        { x: randomX, y: 1 },
        { x: randomX + 1, y: 1 },
      ];
    case 4: // S shape
      return [
        { x: randomX, y: 1 },
        { x: randomX + 1, y: 1 },
        { x: randomX + 1, y: 0 },
        { x: randomX + 2, y: 0 },
      ];
    case 5: // T shape
      return [
        { x: randomX, y: 0 },
        { x: randomX + 1, y: 0 },
        { x: randomX + 2, y: 0 },
        { x: randomX + 1, y: 1 },
      ];
    case 6: // Z shape
      return [
        { x: randomX, y: 0 },
        { x: randomX + 1, y: 0 },
        { x: randomX + 1, y: 1 },
        { x: randomX + 2, y: 1 },
      ];
    default: // will never reach this case but typescript complains if we don't have a default case
      return [];
  }
};
