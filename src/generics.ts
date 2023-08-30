import { Constants } from "./constants";
import { generateRandomBlock } from "./shapes";
import {
  Block,
  BlockAction,
  BlockPosition,
  BoundaryCheck,
  CollisionCheck,
  CubePosition,
  MoveLogic,
  Position,
  RotateLogic,
  State,
} from "./types";

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
 * Applies the given move logic function to the block's position and returns the new block position.
 * @param movelogic - The move logic function to apply to the block's position.
 * @returns A new block position after applying the move logic function.
 */
const move =
  (movelogic: MoveLogic) =>
  (block: BlockPosition): BlockPosition =>
    block.map(movelogic);

// Logic for moving the current block down by one unit
const moveDownLogic: MoveLogic = (pos: Position<number>) => ({
  ...pos,
  y: pos.y + 1,
});

// Logic for moving the current block left by one unit
const moveLeftLogic: MoveLogic = (pos: Position<number>) => ({
  ...pos,
  x: pos.x - 1,
});

// Logic for moving the current block right by one unit
const moveRightLogic: MoveLogic = (pos: Position<number>) => ({
  ...pos,
  x: pos.x + 1,
});

/**
 * Creates a function that moves a block in a specified direction based on the provided move logic and boundary check functions.
 * @param moveLogic A function that takes the current position of the block and returns the new position after moving in a specified direction.
 * @param boundaryCheck A function that takes the current position of the block and returns true if the block has reached the boundary, false otherwise.
 * @returns A function that takes the current block, an array of old blocks, and a boolean indicating if the game has ended, and returns the new position of the block after moving in the specified direction.
 */
const createMoveBlockAction =
  (moveLogic: MoveLogic, boundaryCheck: BoundaryCheck): BlockAction =>
  (currentBlock: Block, oldBlocks: BlockPosition[]): Block => {
    // If there is no current block, the game has ended, the block has reached the boundary, or the block has collided with any old block, it returns the current block without moving it
    if (
      !currentBlock ||
      currentBlock.some(boundaryCheck) ||
      hasObjectCollided(moveLogic, currentBlock, oldBlocks)
    ) {
      return currentBlock;
    }

    // Otherwise, it moves the block in the specified direction
    return move(moveLogic)(currentBlock);
  };

// Moves the current block down by one unit and specifies the boundary to check
export const moveBlockDown: BlockAction = createMoveBlockAction(
  moveDownLogic,
  (cubePos) => cubePos.y + 1 >= Constants.GRID_HEIGHT
);

// Moves the current block left by one unit and specifies the boundary to check
export const moveBlockLeft: BlockAction = createMoveBlockAction(
  moveLeftLogic,
  (cubePos) => cubePos.x - 1 < 0
);

// Moves the current block right by one unit and specifies the boundary to check
export const moveBlockRight: BlockAction = createMoveBlockAction(
  moveRightLogic,
  (cubePos) => cubePos.x + 1 >= Constants.GRID_WIDTH
);

/**
 * Generic function to rotates a block of cubes around its center using the provided rotate logic.
 * @param object The block of cubes to rotate.
 * @param rotateLogic The function that defines how each cube should be rotated around the center.
 * @returns The rotated block of cubes.
 */
const rotate = (
  object: BlockPosition,
  rotateLogic: (pos: CubePosition, center: CubePosition) => CubePosition
): BlockPosition => {
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

  // Rotate each cube in the block around the adjusted center using the provided rotateLogic
  return object.map((pos) => rotateLogic(pos, adjustedCenter));
};

// defines logic for rotating a block clockwise
const rotateClockwiseLogic = (pos: CubePosition, center: CubePosition) => ({
  x: center.x - pos.y + center.y,
  y: center.y + pos.x - center.x,
});

// defines logic for rotating a block anticlockwise
const rotateAntiClockwiseLogic = (pos: CubePosition, center: CubePosition) => ({
  x: center.x + pos.y - center.y,
  y: center.y - pos.x + center.x,
});

/**
 * Creates a function that rotates the current block using the provided rotate logic.
 * @param rotateLogic A function that takes the current block and returns the rotated block.
 * @returns A function that takes the current block, an array of old blocks, and a boolean indicating if the game has ended, and returns the rotated block.
 */

const createRotateBlockAction =
  (rotateLogic: RotateLogic): BlockAction =>
  (currentBlock: Block, oldBlocks: BlockPosition[]): Block => {
    // If there is no current block or the game has ended, it returns the current block without rotating it
    if (!currentBlock) {
      return currentBlock;
    }

    const rotatedBlock = rotateLogic(currentBlock);

    // Check if the rotated block is still within the grid and doesn't hit any old blocks
    if (
      rotatedBlock.some(
        (cubePos) =>
          cubePos.x < 0 ||
          cubePos.x >= Constants.GRID_WIDTH ||
          cubePos.y < 0 ||
          cubePos.y >= Constants.GRID_HEIGHT
      ) ||
      hasObjectCollidedDown(rotatedBlock, oldBlocks) ||
      hasObjectCollidedLeft(rotatedBlock, oldBlocks) ||
      hasObjectCollidedRight(rotatedBlock, oldBlocks)
    ) {
      // If not, it returns the current block without rotating it
      return currentBlock;
    }

    // If the rotated block is valid, it returns the rotated block
    return rotatedBlock;
  };

// Use the rotate logic functions to define the rotate block actions in clockwise direction
export const rotateBlockClockwise: BlockAction = createRotateBlockAction(
  (block) => rotate(block, rotateClockwiseLogic)
);

// Use the rotate logic functions to define the rotate block actions in anticlockwise direction
export const rotateBlockAntiClockwise: BlockAction = createRotateBlockAction(
  (block) => rotate(block, rotateAntiClockwiseLogic)
);

/**
 * Returns a function that checks if a block has collided with another block after applying the move logic.
 * @param moveLogic A function that takes in a position and returns a new position after applying the move logic.
 * @returns A function that takes in an block position and an array of old block positions, and returns a boolean indicating if the block has collided with any of the old blocks.
 */
export const hasObjectCollided = (
  moveLogic: MoveLogic,
  block: BlockPosition,
  oldBlocks: BlockPosition[]
): boolean => {
  // Define a function that checks if a cube has collided with another cube after applying the move logic
  const hitCheck = (oldPos: CubePosition, pos: CubePosition) => {
    const newPos = moveLogic(pos);
    return oldPos.x === newPos.x && oldPos.y === newPos.y;
  };

  // Check if an object has collided with another object after applying the move logic
  return oldBlocks.some((oldObject) =>
    oldObject.some((oldPos) => block.some((pos) => hitCheck(oldPos, pos)))
  );
};

export const hasObjectCollidedDown: CollisionCheck = (block, oldObjects) =>
  hasObjectCollided(moveDownLogic, block, oldObjects);

const hasObjectCollidedLeft: CollisionCheck = (block, oldObjects) =>
  hasObjectCollided(moveLeftLogic, block, oldObjects);

const hasObjectCollidedRight: CollisionCheck = (block, oldObjects) =>
  hasObjectCollided(moveRightLogic, block, oldObjects);
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
 * Calculates the rows of cubes in the grid based on the given blocks.
 * @param oldBlocks The blocks to calculate the rows from.
 * @returns An array of cube positions representing the rows in the grid.
 */
export const calculateRows = (oldBlocks: BlockPosition[]): CubePosition[][] => {
  // Create an array of length GRID_HEIGHT and map each element to an array of cubes that belong to that row
  return Array.from({ length: Constants.GRID_HEIGHT }, (_, index) =>
    // Reduce the oldBlocks array to an array of cubes that belong to the current row
    oldBlocks.reduce(
      (row, block) => row.concat(block.filter((cube) => cube.y === index)),
      [] as CubePosition[]
    )
  );
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
 * Returns the tick speed based on the score.
 * If the score is greater than or equal to the difficulty barrier score, it returns the tick rate decrease in milliseconds.
 * Otherwise, it returns the tick rate in milliseconds.
 * @param score The current score.
 * @returns The tick speed in milliseconds.
 */
export const getTickRate = (score: number) => {
  if (score >= Constants.DIFFICULTY_BARRIER_SCORE) {
    return Constants.TICK_RATE_DECREASE_MS;
  }
  return Constants.TICK_RATE_MS;
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
