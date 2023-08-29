export type Position<T> = { x: T; y: T };

export type CubePosition = Position<number>;
export type BlockPosition = Position<number>[];

export type Block = BlockPosition | undefined; // this can be undefined because the game starts with no current block or when as block reaches the bottom, there is no current block

export type Key = "KeyA" | "KeyD" | "KeyH" | "KeyQ" | "KeyE" | "KeyS";

export type Direction = "Left" | "Right" | "Down";
export type Rotation = "RotateClockwise" | "RotateAntiClockwise";

export type Event = Direction | Rotation | "Hold" | "Tick";

export type State = Readonly<{
  gameEnd: boolean;
  currentBlock?: BlockPosition;
  nextBlock?: BlockPosition;
  holdBlock?: BlockPosition;
  oldBlocks: BlockPosition[];
  score: number;
  highScore: number;
}>;
