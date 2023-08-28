import {
  clearFullRows,
  generateBlock,
  hasBlockReachedBottom,
  hasBlockReachedTop,
  hasObjectCollidedDown,
  holdCurrentBlock,
  moveBlockDown,
  moveBlockLeft,
  moveBlockRight,
  rotateBlockAntiClockwise,
  rotateBlockClockwise,
  setCurrentBlock,
} from "./generics";

import { Block, BlockPosition, Event, State } from "./types";

/**
 * The initial state of the game.
 */
export const initialState: State = {
  gameEnd: false,
  oldBlocks: [],
  score: 0,
  nextBlock: undefined,
};

/**
 * Updates the game state for each tick (game cycle).
 * @param state - The current game state.
 * @returns The new game state after the tick.
 */
export const tick = (state: State): State => {
  // Clear full rows and get the new blocks and score
  const { newBlocks, newScore } = clearFullRows(state.oldBlocks, state.score);

  // Check if the game is over (a block has reached the top)
  const gameOver = hasBlockReachedTop(newBlocks);

  // If the game is over, return the updated state with gameEnd set to true
  if (gameOver) {
    return {
      ...state,
      gameEnd: true,
      oldBlocks: newBlocks,
      score: newScore,
    };
  }

  // Generate a new block
  const { newCurrentBlock, newNextBlock } = generateBlock(state.nextBlock);

  // Check if the current block has reached the bottom or collided with another block
  const hasLanded =
    !state.currentBlock ||
    hasBlockReachedBottom(state.currentBlock) ||
    hasObjectCollidedDown(state.currentBlock)(state.oldBlocks);

  // If the current block has landed, add it to oldBlocks and generate a new current block
  if (hasLanded) {
    return {
      ...state,
      currentBlock: newCurrentBlock, // Set the current block to the next block
      nextBlock: newNextBlock, // Generate a new next block
      oldBlocks: [
        ...newBlocks,
        ...(state.currentBlock ? [state.currentBlock] : []),
      ], // Add the landed block to the old blocks
      score: newScore,
    };
  } else {
    // If the current block hasn't landed, try to move it down
    const movedCurrentBlock = moveBlockDown(
      state.currentBlock,
      state.oldBlocks,
      state.gameEnd
    );
    return {
      ...state,
      currentBlock: movedCurrentBlock,
      oldBlocks: newBlocks,
      score: newScore,
    };
  }
};

/**
 * Creates a game action based on the given movement.
 * @param action - The action to perform.
 * @returns The new game state after the action.
 */
const createGameAction = (
  action: (
    currentBlock: Block,
    oldBlocks: BlockPosition[],
    gameEnd: boolean
  ) => Block
) => {
  return (s: State): State => {
    const newBlock = action(s.currentBlock, s.oldBlocks, s.gameEnd);
    return newBlock ? { ...s, currentBlock: newBlock } : s;
  };
};

/**
 * The game actions that can be performed.
 */
export const gameActions: { [key in Event]: (s: State) => State } = {
  Left: createGameAction(moveBlockLeft),
  Right: createGameAction(moveBlockRight),
  RotateClockwise: createGameAction(rotateBlockClockwise),
  RotateAntiClockwise: createGameAction(rotateBlockAntiClockwise),
  Tick: (s: State) => tick(s),
  Hold: (s: State) => {
    const { newCurrentBlock, newHoldBlock } = holdCurrentBlock(
      s.currentBlock,
      s.holdBlock
    );
    const { newCurrentBlock: finalCurrentBlock, newNextBlock } =
      setCurrentBlock(newCurrentBlock, s.nextBlock);
    return {
      ...s,
      currentBlock: finalCurrentBlock,
      nextBlock: newNextBlock,
      holdBlock: newHoldBlock,
    };
  },
};
