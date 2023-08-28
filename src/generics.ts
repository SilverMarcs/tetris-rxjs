import { Constants } from "./constants";
import { generateRandomBlock } from "./shapes";
import { Block, BlockPosition, CubePosition, Position } from "./types";

/**
 * Generates a new current block and a new next block.
 * @param nextBlock - The next block to be generated.
 * @returns An object containing the new current block and the new next block.
 */
export const generateBlock = (
  nextBlock: Block
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
export const move =
  (movelogic: (pos: Position<number>) => Position<number>) =>
  (block: BlockPosition): BlockPosition =>
    block.map(movelogic);

const moveDownLogic = (pos: Position<number>) => ({ ...pos, y: pos.y + 1 });
const moveLeftLogic = (pos: Position<number>) => ({ ...pos, x: pos.x - 1 });
const moveRightLogic = (pos: Position<number>) => ({ ...pos, x: pos.x + 1 });

/*
 * Returns a function that moves a block down.
 */
// const moveDown = move("Down");
//
/**
 * Returns a function that checks if an object has collided with another object in a given direction.
 * @param direction - The direction in which the collision should be checked.
 * @returns A function that checks if an object has collided with another object in the given direction.
 */
export const hasObjectCollided = (
  moveLogic: (pos: Position<number>) => Position<number>
): ((objectPos: BlockPosition) => (oldObjects: BlockPosition[]) => boolean) => {
  // Define a function that checks if a cube has collided with another cube after applying the move logic
  const hitCheck = (oldPos: CubePosition, pos: CubePosition) => {
    const newPos = moveLogic(pos);
    return oldPos.x === newPos.x && oldPos.y === newPos.y;
  };

  // Return a function that checks if an object has collided with another object after applying the move logic
  return (objectPos: BlockPosition) =>
    (oldObjects: BlockPosition[]): boolean =>
      oldObjects.some((oldObject) =>
        oldObject.some((oldPos) =>
          objectPos.some((pos) => hitCheck(oldPos, pos))
        )
      );
};

export const hasObjectCollidedDown = hasObjectCollided(moveDownLogic);
const hasObjectCollidedLeft = hasObjectCollided(moveLeftLogic);
const hasObjectCollidedRight = hasObjectCollided(moveRightLogic);

/**
 * Rotates a block clockwise.
 * @param object - The block to be rotated.
 * @returns The rotated block.
 */
// Common rotate function
const rotate = (object: BlockPosition, isClockwise: boolean): BlockPosition => {
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
  return object.map((pos) => {
    const rotatedPos = isClockwise
      ? {
          x: adjustedCenter.x - pos.y + adjustedCenter.y,
          y: adjustedCenter.y + pos.x - adjustedCenter.x,
        }
      : {
          x: adjustedCenter.x + pos.y - adjustedCenter.y,
          y: adjustedCenter.y - pos.x + adjustedCenter.x,
        };
    return rotatedPos;
  });
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
  moveLogic: (pos: Position<number>) => Position<number>,
  boundaryCheck: (cubePos: CubePosition) => boolean
): boolean => {
  // Check if the block has reached the boundary or collided with another block
  return (
    !block.some(boundaryCheck) &&
    !hasObjectCollided(moveLogic)(block)(oldBlocks)
  );
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
  (
    moveLogic: (pos: Position<number>) => Position<number>,
    boundaryCheck: (cubePos: CubePosition) => boolean
  ) =>
  (
    currentBlock: Block,
    oldBlocks: BlockPosition[],
    gameEnd: boolean
  ): Block => {
    // If there is no current block, the game has ended, the block has reached the boundary, or the block has collided with any old block, it returns the current block without moving it
    if (
      !currentBlock ||
      gameEnd ||
      currentBlock.some(boundaryCheck) ||
      hasObjectCollided(moveLogic)(currentBlock)(oldBlocks)
    ) {
      return currentBlock;
    }

    // Otherwise, it moves the block in the specified direction
    return move(moveLogic)(currentBlock);
  };

/**
 * Function to move the block to the left.
 * It uses the createMoveBlockAction function with move logic and boundary check for left movement.
 */
export const moveBlockDown = createMoveBlockAction(
  moveDownLogic,
  (cubePos) => cubePos.y + 1 >= Constants.GRID_HEIGHT
);
export const moveBlockLeft = createMoveBlockAction(
  moveLeftLogic,
  (cubePos) => cubePos.x - 1 < 0
);
export const moveBlockRight = createMoveBlockAction(
  moveRightLogic,
  (cubePos) => cubePos.x + 1 >= Constants.GRID_WIDTH
);
/**
 * Function to rotate the current block.
 * @param currentBlock - The block that needs to be rotated.
 * @param oldBlocks - The blocks that have already been placed.
 * @param gameEnd - Indicates if the game has ended.
 * @returns The new position of the block after rotation. If the rotation is not possible, it returns the current block without rotating.
 */
export const rotateBlock = (
  currentBlock: Block,
  oldBlocks: BlockPosition[],
  gameEnd: boolean,
  isClockwise: boolean
): Block => {
  // If there is no current block or the game has ended, it returns the current block without rotating it
  if (!currentBlock || gameEnd) {
    return currentBlock;
  }

  const rotatedBlock = rotate(currentBlock, isClockwise);

  // Checks if the rotated block is still within the grid and doesn't hit any old blocks
  if (
    rotatedBlock.some(
      (cubePos) =>
        cubePos.x < 0 ||
        cubePos.x >= Constants.GRID_WIDTH ||
        cubePos.y < 0 ||
        cubePos.y >= Constants.GRID_HEIGHT
    ) ||
    hasObjectCollidedDown(rotatedBlock)(oldBlocks) ||
    hasObjectCollidedLeft(rotatedBlock)(oldBlocks) ||
    hasObjectCollidedRight(rotatedBlock)(oldBlocks)
  ) {
    // If not, it returns the current block without rotating it
    return currentBlock;
  }

  // If the rotated block is valid, it returns the rotated block
  return rotatedBlock;
};

/*
 * Provides simple API for rotating blocks clockwise
 */
export const rotateBlockClockwise = (
  currentBlock: Block,
  oldBlocks: BlockPosition[],
  gameEnd: boolean
): Block => {
  return rotateBlock(currentBlock, oldBlocks, gameEnd, true);
};

/*
 * Provides simple API for rotating blocks anticlockwise
 */
export const rotateBlockAntiClockwise = (
  currentBlock: Block,
  oldBlocks: BlockPosition[],
  gameEnd: boolean
): Block => {
  return rotateBlock(currentBlock, oldBlocks, gameEnd, false);
};

/**
 * Holds the current block and the hold block.
 * @param currentBlock - The current block to be held.
 * @param holdBlock - The block to be held.
 * @returns An object containing the new current block and the new hold block.
 */
export const holdCurrentBlock = (
  currentBlock: Block,
  holdBlock: Block
): {
  newCurrentBlock: Block;
  newHoldBlock: Block;
} => {
  if (!currentBlock) {
    // If there is no current block, return the current block and hold block as is
    return { newCurrentBlock: currentBlock, newHoldBlock: holdBlock };
  } else if (!holdBlock) {
    // If there is no hold block, set the current block as the hold block and return undefined for the current block
    return { newCurrentBlock: undefined, newHoldBlock: currentBlock };
  } else {
    // If there is a hold block, swap the current block and the hold block
    return { newCurrentBlock: holdBlock, newHoldBlock: currentBlock };
  }
};

/**
 * Sets the current block and the next block.
 * @param currentBlock - The current block to be set.
 * @param nextBlock - The next block to be set.
 * @returns An object containing the new current block and the new next block.
 */
export const setCurrentBlock = (
  currentBlock: Block,
  nextBlock: Block
): {
  newCurrentBlock: Block;
  newNextBlock: Block;
} => {
  if (currentBlock) {
    // If there is a current block, return the current block and next block as is
    return { newCurrentBlock: currentBlock, newNextBlock: nextBlock };
  } else {
    // If there is no current block, set the next block as the current block and generate a new next block
    const { newCurrentBlock, newNextBlock } = generateBlock(nextBlock);
    return { newCurrentBlock, newNextBlock };
  }
};

/**
 * Returns the tick speed based on the score.
 * If the score is greater than or equal to the difficulty barrier score, it returns the tick rate decrease in milliseconds.
 * Otherwise, it returns the tick rate in milliseconds.
 * @param score The current score.
 * @returns The tick speed in milliseconds.
 */
export const getTickSpeed = (score: number) => {
  if (score >= Constants.DIFFICULTY_BARRIER_SCORE) {
    return Constants.TICK_RATE_DECREASE_MS;
  }
  return Constants.TICK_RATE_MS;
};
