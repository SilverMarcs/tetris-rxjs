/**
 * Contains utility functions for working with generic types.
 * @packageDocumentation
 */

import { Constants } from "./constants";
import { generateRandomBlock } from "./shapes";
import { BlockPosition, CubePosition, CurrentBlock, Direction } from "./types";

/**
 * Generates a new current block and a new next block.
 * @param nextBlock - The next block to be generated.
 * @returns An object containing the new current block and the new next block.
 */
export const generateBlock = (
  nextBlock: CurrentBlock
): { newCurrentBlock: BlockPosition; newNextBlock: BlockPosition } => {
  // If nextBlock is defined, use it as the new current block, otherwise generate a new random block
  const newCurrentBlock = nextBlock ? nextBlock : generateRandomBlock();
  // Generate a new random block for the next block
  const newNextBlock = generateRandomBlock();

  return { newCurrentBlock, newNextBlock };
};

/**
 * Returns a function that moves a block in a given direction.
 * @param direction - The direction in which the block should be moved.
 * @returns A function that moves a block in the given direction.
 */
export const move = (
  direction: Direction
): ((block: BlockPosition) => BlockPosition) => {
  return (block: BlockPosition): BlockPosition =>
    block.map((pos) => {
      switch (direction) {
        case "Down":
          return { ...pos, y: pos.y + 1 };
        case "Left":
          return { ...pos, x: pos.x - 1 };
        case "Right":
          return { ...pos, x: pos.x + 1 };
      }
    });
};

/**
 * Returns a function that checks if an object has collided with another object in a given direction.
 * @param direction - The direction in which the collision should be checked.
 * @returns A function that checks if an object has collided with another object in the given direction.
 */
export const hasObjectCollided = (
  direction: Direction
): ((objectPos: BlockPosition) => (oldObjects: BlockPosition[]) => boolean) => {
  // Define an object that maps each direction to a function that checks if a cube has collided with another cube in that direction
  const hitCheck: Record<
    Direction,
    (oldPos: CubePosition, pos: CubePosition) => boolean
  > = {
    Down: (oldPos, pos) => oldPos.y === pos.y + 1 && oldPos.x === pos.x,
    Left: (oldPos, pos) => oldPos.x === pos.x - 1 && oldPos.y === pos.y,
    Right: (oldPos, pos) => oldPos.x === pos.x + 1 && oldPos.y === pos.y,
  };

  // Return a function that checks if an object has collided with another object in the given direction
  return (objectPos: BlockPosition) =>
    (oldObjects: BlockPosition[]): boolean =>
      oldObjects.some((oldObject) =>
        oldObject.some((oldPos) =>
          objectPos.some((pos) => hitCheck[direction](oldPos, pos))
        )
      );
};

/**
 * Rotates a block clockwise.
 * @param object - The block to be rotated.
 * @returns The rotated block.
 */
export const rotate = (object: BlockPosition): BlockPosition => {
  // Calculate the center of the block
  const center = object.reduce(
    (sum, pos) => ({ x: sum.x + pos.x, y: sum.y + pos.y }),
    { x: 0, y: 0 }
  );
  const centerX = Math.floor(center.x / object.length);
  const centerY = Math.floor(center.y / object.length);

  // Adjust the center to ensure it is in the middle of the block
  const adjustedCenter = {
    x: centerX % 2 === 0 ? centerX : centerX + 1,
    y: centerY % 2 === 1 ? centerY : centerY + 1,
  };

  // Rotate each cube in the block around the adjusted center
  return object.map((pos) => ({
    x: adjustedCenter.x - pos.y + adjustedCenter.y,
    y: adjustedCenter.y + pos.x - adjustedCenter.x,
  }));
};

/**
 * Checks if a block can be moved in a given direction.
 * @param block - The block to be moved.
 * @param oldBlocks - The existing blocks on the board.
 * @param direction - The direction in which the block should be moved.
 * @returns A boolean indicating whether the block can be moved in the given direction.
 */
export const canMoveBlock = (
  block: BlockPosition,
  oldBlocks: BlockPosition[],
  direction: Direction
): boolean => {
  if (direction === "Down") {
    // Check if the block has reached the bottom of the board or collided with another block
    return (
      !hasBlockReachedBottom(block) &&
      !hasObjectCollided(direction)(block)(oldBlocks)
    );
  } else {
    const moveDirection = direction === "Left" ? -1 : 1;
    // Check if the block will go out of bounds or collide with another block
    return (
      !block.some(
        (cubePos) =>
          cubePos.x + moveDirection < 0 ||
          cubePos.x + moveDirection >= Constants.GRID_WIDTH
      ) && !hasObjectCollided(direction)(block)(oldBlocks)
    );
  }
};

/**
 * Checks if a block has reached the bottom of the board.
 * @param blockPos - The position of the block.
 * @returns A boolean indicating whether the block has reached the bottom of the board.
 */
export const hasBlockReachedBottom = (blockPos: BlockPosition): boolean =>
  blockPos.some((cubePos) => cubePos.y >= Constants.GRID_HEIGHT - 1);

/**
 * Drops the blocks above cleared rows.
 * @param oldBlocks - The existing blocks on the board.
 * @param clearedRows - The rows that have been cleared.
 * @returns The updated blocks after dropping the blocks above cleared rows.
 */
export const dropBlocksAboveClearedRows = (
  oldBlocks: BlockPosition[],
  clearedRows: number[]
): BlockPosition[] =>
  oldBlocks.map((block) =>
    block.map((cube) => {
      // Calculate the number of cleared rows below the cube
      const rowsClearedBelow = clearedRows.filter((row) => row > cube.y).length;
      // Drop the cube by the number of cleared rows below it
      return rowsClearedBelow > 0
        ? { x: cube.x, y: cube.y + rowsClearedBelow }
        : cube;
    })
  );

/**
 * Calculates the rows on the board.
 * @param oldBlocks - The existing blocks on the board.
 * @returns An array of arrays containing the positions of the cubes in each row.
 */
export const calculateRows = (oldBlocks: BlockPosition[]): CubePosition[][] => {
  // Create an array of empty arrays, one for each row on the board
  const rows: CubePosition[][] = Array.from(
    { length: Constants.GRID_HEIGHT },
    () => []
  );

  // Add each cube to the array for its row
  oldBlocks.forEach((block) =>
    block.forEach((cube) => rows[cube.y].push(cube))
  );

  return rows;
};

/**
 * Finds the rows that are completely filled with cubes.
 * @param rows - The rows on the board.
 * @returns An array containing the indices of the rows that are completely filled with cubes.
 */
export const findFullRows = (rows: CubePosition[][]): number[] => {
  // map each row to its index if it is full, otherwise -1
  return rows
    .map((row, index) => (row.length === Constants.GRID_WIDTH ? index : -1))
    .filter((index) => index !== -1);
};

/**
 * Removes the cubes in the rows that are completely filled with cubes.
 * @param oldBlocks - The existing blocks on the board.
 * @param fullRows - The rows that are completely filled with cubes.
 * @returns The updated blocks after removing the cubes in the rows that are completely filled with cubes.
 */
export const removeCubesInFullRows = (
  oldBlocks: BlockPosition[],
  fullRows: number[]
): BlockPosition[] => {
  // filter out the cubes in the full rows
  return oldBlocks.map((block) =>
    block.filter((cubePos) => !fullRows.includes(cubePos.y))
  );
};

/**
 * Removes the empty blocks from the board.
 * @param blocks - The existing blocks on the board.
 * @returns The updated blocks after removing the empty blocks.
 */
export const removeEmptyBlocks = (blocks: BlockPosition[]): BlockPosition[] => {
  // filter out the empty blocks
  return blocks.filter((block) => block.length > 0);
};

/**
 * Clears the rows that are completely filled with cubes.
 * @param oldBlocks - The existing blocks on the board.
 * @param score - The current score.
 * @returns An array containing the updated blocks and the new score.
 */
export const clearFullRows = (
  oldBlocks: BlockPosition[],
  score: number
): { newBlocks: BlockPosition[]; newScore: number } => {
  const rows = calculateRows(oldBlocks);
  const fullRows = findFullRows(rows);

  if (fullRows.length === 0) {
    return { newBlocks: oldBlocks, newScore: score }; // no full rows, return the blocks and score as is
  }

  const newScore = score + fullRows.length * Constants.SINGLE_ROW_FILL_SCORE; // increase score by 100 for each full row

  const remainingBlocks = removeCubesInFullRows(oldBlocks, fullRows);
  const nonEmptyBlocks = removeEmptyBlocks(remainingBlocks);

  const newBlocks = dropBlocksAboveClearedRows(nonEmptyBlocks, fullRows); // drop blocks above cleared rows

  return { newBlocks, newScore };
};

/**
 * Checks if a block has reached the top of the board.
 * @param oldBlocks - The existing blocks on the board.
 * @returns A boolean indicating whether a block has reached the top of the board.
 */
export const hasBlockReachedTop = (oldBlocks: BlockPosition[]): boolean => {
  // check if any cube in any block has reached the top of the board
  return oldBlocks.some((block) => block.some((cubePos) => cubePos.y === 0));
};

/**
 * Function to update the tick rate based on the current score.
 * The tick rate determines the speed at which the blocks fall.
 * @param score - The current score.
 * @param currentTickRate - The current tick rate.
 * @returns The updated tick rate. If the score has reached the difficulty barrier, the tick rate decreases (game speeds up). Otherwise, the tick rate remains the same.
 */
export const updateTickRate = (
  score: number,
  currentTickRate: number
): number => {
  // If the score has reached the difficulty barrier, the tick rate decreases (game speeds up)
  if (score >= Constants.DIFFICULTY_BARRIER_SCORE) {
    return Constants.TICK_RATE_DECREASE_MS;
  }
  // Otherwise, the tick rate remains the same
  return currentTickRate;
};

/**
 * A higher-order function that creates a function to move a block in a specified direction.
 * @param direction - The direction to move the block.
 * @param boundaryCheck - A function that checks if the block has reached the boundary.
 * @returns A function that takes the current block, old blocks, and game end status, and returns the new block position.
 */
const createMoveBlockAction =
  (direction: Direction, boundaryCheck: (cubePos: CubePosition) => boolean) =>
  (
    currentBlock: CurrentBlock,
    oldBlocks: BlockPosition[],
    gameEnd: boolean
  ): CurrentBlock => {
    // If there is no current block, the game has ended, the block has reached the boundary, or the block has collided with any old block, it returns the current block without moving it
    if (
      !currentBlock ||
      gameEnd ||
      currentBlock.some(boundaryCheck) ||
      hasObjectCollided(direction)(currentBlock)(oldBlocks)
    ) {
      return currentBlock;
    }

    // Otherwise, it moves the block in the specified direction
    return move(direction)(currentBlock);
  };

/**
 * Function to move the block to the left.
 * It uses the createMoveBlockAction function with "Left" direction and boundary check for left movement.
 */
export const moveBlockLeft = createMoveBlockAction(
  "Left",
  (cubePos) => cubePos.x - 1 < 0
);

/**
 * Function to move the block to the right.
 * It uses the createMoveBlockAction function with "Right" direction and boundary check for right movement.
 */
export const moveBlockRight = createMoveBlockAction(
  "Right",
  (cubePos) => cubePos.x + 1 >= Constants.GRID_WIDTH
);

/**
 * Function to rotate the current block.
 * @param currentBlock - The block that needs to be rotated.
 * @param oldBlocks - The blocks that have already been placed.
 * @param gameEnd - Indicates if the game has ended.
 * @returns The new position of the block after rotation. If the rotation is not possible, it returns the current block without rotating.
 */
export const rotateCurrentBlock = (
  currentBlock: CurrentBlock,
  oldBlocks: BlockPosition[],
  gameEnd: boolean
): CurrentBlock => {
  // If there is no current block or the game has ended, it returns the current block without rotating it
  if (!currentBlock || gameEnd) {
    return currentBlock;
  }

  // Calculates the new position of the block after rotating it
  const rotatedBlock = rotate(currentBlock);

  // Checks if the rotated block is still within the grid and doesn't hit any old blocks
  if (
    rotatedBlock.some(
      (cubePos) =>
        cubePos.x < 0 ||
        cubePos.x >= Constants.GRID_WIDTH ||
        cubePos.y < 0 ||
        cubePos.y >= Constants.GRID_HEIGHT
    ) ||
    hasObjectCollided("Down")(rotatedBlock)(oldBlocks) ||
    hasObjectCollided("Left")(rotatedBlock)(oldBlocks) ||
    hasObjectCollided("Right")(rotatedBlock)(oldBlocks)
  ) {
    // If not, it returns the current block without rotating it
    return currentBlock;
  }

  // If the rotated block is valid, it returns the rotated block
  return rotatedBlock;
};

/**
 * Function to move the current block down.
 * @param oldBlocks - The blocks that have already been placed.
 * @param currentBlock - The block that needs to be moved down.
 * @returns The new position of the block after moving it down. If the movement is not possible, it returns undefined.
 */
export const moveCurrentBlockDown = (
  oldBlocks: BlockPosition[],
  currentBlock: CurrentBlock
): CurrentBlock => {
  // If there is no current block or the block has reached the bottom or the block has collided with any old block, it returns undefined
  if (
    !currentBlock ||
    hasBlockReachedBottom(currentBlock) ||
    hasObjectCollided("Down")(currentBlock)(oldBlocks)
  ) {
    return undefined;
  } else {
    // Otherwise, it moves the block down
    return move("Down")(currentBlock);
  }
};