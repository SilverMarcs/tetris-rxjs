import { Constants } from "./constants";
import {
  clearFullRows,
  generateBlock,
  hasBlockReachedTop,
  holdCurrentBlock,
  moveBlockLeft,
  moveBlockRight,
  moveCurrentBlockDown,
  rotateCurrentBlock,
  setCurrentBlock,
  updateTickRate,
} from "./generics";

import { BlockPosition, Movement, State } from "./types";

/**
 * The initial state of the game.
 */
export const initialState: State = {
  gameEnd: false,
  oldBlocks: [],
  score: 0,
  highScore: 0,
  nextBlock: undefined,
  tickRate: Constants.TICK_RATE_MS,
};

/**
 * Updates the game state for each tick (game cycle).
 * @param state - The current game state.
 * @returns The new game state after the tick.
 */
export const tick = (state: State): State => {
  // Clear full rows and get the new blocks and score
  const { newBlocks, newScore } = clearFullRows(state.oldBlocks, state.score);

  // Update the tick rate based on the new score
  const newTickRate = updateTickRate(newScore, state.tickRate);

  // Check if the game is over (a block has reached the top)
  const gameOver = hasBlockReachedTop(newBlocks);

  // Calculate the high score
  const highScore = Math.max(state.score, state.highScore);

  // If the game is over, return the updated state with gameEnd set to true
  if (gameOver) {
    return {
      ...state,
      gameEnd: true,
      oldBlocks: newBlocks,
      score: newScore,
      tickRate: newTickRate,
      highScore, // Include the high score in the new state
    };
  }

  // Generate a new block
  const { newCurrentBlock, newNextBlock } = generateBlock(state.nextBlock);

  // Try to move the current block down
  const movedCurrentBlock = moveCurrentBlockDown(
    state.oldBlocks,
    state.currentBlock
  );

  // If the current block couldn't be moved down, it means it has landed
  if (!movedCurrentBlock) {
    return {
      ...state,
      currentBlock: newCurrentBlock, // Set the current block to the next block
      nextBlock: newNextBlock, // Generate a new next block
      oldBlocks: state.currentBlock
        ? [...newBlocks, state.currentBlock] // Add the landed block to the old blocks
        : newBlocks,
      score: newScore,
      tickRate: newTickRate,
      highScore, // Include the high score in the new state
    };
  } else {
    // If the current block could be moved down, return the updated state with the moved block
    return {
      ...state,
      currentBlock: movedCurrentBlock,
      oldBlocks: newBlocks,
      score: newScore,
      tickRate: newTickRate,
      highScore, // Include the high score in the new state
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

/**
 * The game actions that can be performed.
 */
export const gameActions: { [key in Movement]: (s: State) => State } = {
  Left: createGameAction(moveBlockLeft),
  Right: createGameAction(moveBlockRight),
  Rotate: createGameAction(rotateCurrentBlock),
  Down: (s: State) => tick(s),
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
