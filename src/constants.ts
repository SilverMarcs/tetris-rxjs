export const Viewport = {
  CANVAS_WIDTH: 200,
  CANVAS_HEIGHT: 400,
  PREVIEW_WIDTH: 160,
  PREVIEW_HEIGHT: 80,
} as const;

export const Constants = {
  TICK_RATE_MS: 150, // default tick rate
  TICK_RATE_DECREASE_MS: 100, // tick rate after DIFFICULTY_BARRIER_SCORE is reached
  DIFFICULTY_BARRIER_SCORE: 200, // score at which the game gets harder
  GRID_WIDTH: 10, // width of the grid
  GRID_HEIGHT: 20, // height of the grid
  SINGLE_ROW_FILL_SCORE: 100, // score for filling a single row
  GAME_OVER_DELAY_MS: 3000, // delay before the game over screen disappears
} as const;

export const Cube = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};
