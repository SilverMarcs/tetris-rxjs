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
} from "./types";

export const generateBlock = (
  nextBlock: Block
): { newCurrentBlock: BlockPosition; newNextBlock: BlockPosition } => {
  // If nextBlock is defined, use it as the new current block, otherwise generate a new random block
  const newCurrentBlock = nextBlock ? nextBlock : generateRandomBlock();
  // Generate a new random block for the next block
  const newNextBlock = generateRandomBlock();

  return { newCurrentBlock, newNextBlock };
};

/* Move related functions */

/**
 * Applies the given move logic function to the block's position and returns the new block position.
 * @param movelogic - The move logic function to apply to the block's position.
 * @returns A new block position after applying the move logic function.
 */
const move =
  (movelogic: MoveLogic) =>
  (block: BlockPosition): BlockPosition =>
    block.map(movelogic);

const moveDownLogic: MoveLogic = (pos: Position<number>) => ({
  ...pos,
  y: pos.y + 1,
});

const moveLeftLogic: MoveLogic = (pos: Position<number>) => ({
  ...pos,
  x: pos.x - 1,
});

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

export const moveBlockDown: BlockAction = createMoveBlockAction(
  moveDownLogic,
  (cubePos) => cubePos.y + 1 >= Constants.GRID_HEIGHT
);

export const moveBlockLeft: BlockAction = createMoveBlockAction(
  moveLeftLogic,
  (cubePos) => cubePos.x - 1 < 0
);

export const moveBlockRight: BlockAction = createMoveBlockAction(
  moveRightLogic,
  (cubePos) => cubePos.x + 1 >= Constants.GRID_WIDTH
);

/* Rotation related functions */

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

export const rotateBlockClockwise: BlockAction = createRotateBlockAction(
  (block) => rotate(block, rotateClockwiseLogic)
);

export const rotateBlockAntiClockwise: BlockAction = createRotateBlockAction(
  (block) => rotate(block, rotateAntiClockwiseLogic)
);

/* Collision check related functions */

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

/* Clearing full rows related functions */

export const clearFullRows = (
  oldBlocks: BlockPosition[],
  score: number
): { newBlocks: BlockPosition[]; newScore: number } => {
  const rows = calculateRowsInGrid(oldBlocks);
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

export const calculateRowsInGrid = (
  oldBlocks: ReadonlyArray<BlockPosition>
): ReadonlyArray<ReadonlyArray<CubePosition>> => {
  return Array.from({ length: Constants.GRID_HEIGHT }, (_, index) =>
    oldBlocks.reduce(
      (row, block) => [...row, ...block.filter((cube) => cube.y === index)],
      [] as ReadonlyArray<CubePosition>
    )
  );
};

export const findFullRows = (
  rows: ReadonlyArray<ReadonlyArray<CubePosition>>
): number[] => {
  return rows
    .map((row, index) => (row.length === Constants.GRID_WIDTH ? index : -1))
    .filter((index) => index !== -1);
};

export const removeCubesInFullRows = (
  oldBlocks: BlockPosition[],
  fullRows: number[]
): BlockPosition[] => {
  // filter out the cubes in the full rows
  return oldBlocks.map((block) =>
    block.filter((cubePos) => !fullRows.includes(cubePos.y))
  );
};

// Removes the empty blocks from the board with length 0. It is used to clear off empty BlockPosition arrays
export const removeEmptyBlocks = (blocks: BlockPosition[]): BlockPosition[] => {
  return blocks.filter((block) => block.length > 0);
};

/* Hold block related functions */

// stores the current block in its current position for later use
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

// sets the current block to the next block and generates a new next block
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

/* Misc functions */

export const hasBlockReachedTop = (oldBlocks: BlockPosition[]): boolean => {
  // check if any cube in any block has reached the top of the board
  return oldBlocks.some((block) => block.some((cubePos) => cubePos.y === 0));
};

export const hasBlockReachedBottom = (blockPos: BlockPosition): boolean =>
  blockPos.some((cubePos) => cubePos.y >= Constants.GRID_HEIGHT - 1);

// gets tick rate based on the current score. It is possible to introduce other forms of difficulty by changing this function
// Example could be increasing tick rate by a set value for every multiple of 200 points
export const getTickRate = (score: number) => {
  if (score >= Constants.DIFFICULTY_BARRIER_SCORE) {
    return Constants.TICK_RATE_DECREASE_MS;
  }
  return Constants.TICK_RATE_MS;
};
