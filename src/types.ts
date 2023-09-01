export type Position<T> = { x: T; y: T };

export type CubePosition = Readonly<Position<number>>;
export type BlockPosition = ReadonlyArray<Position<number>>;

export type Block = BlockPosition | undefined; // this can be undefined because the game starts with no current block or when as block reaches the bottom, there is no current block

export type Key = "KeyA" | "KeyD" | "KeyH" | "KeyQ" | "KeyE" | "KeyS" | "KeyR";

export type Direction = "Left" | "Right" | "Down";
export type Rotation = "RotateClockwise" | "RotateAntiClockwise";

export type GameEvent = Direction | Rotation | "Hold" | "Tick" | "Restart";

export type MoveLogic = (pos: Position<number>) => Position<number>;
export type BoundaryCheck = (cubePos: CubePosition) => boolean;
export type RotateLogic = (block: BlockPosition) => BlockPosition;
// BlockAction and CollisionCheck are very similar, they have semantic differences so they are declared separately
export type BlockAction = (
  currentBlock: Block,
  oldBlocks: BlockPosition[]
) => Block;
export type CollisionCheck = (
  block: BlockPosition,
  oldObjects: BlockPosition[]
) => boolean;

export type State = Readonly<{
  gameEnd: boolean;
  currentBlock?: BlockPosition;
  nextBlock?: BlockPosition;
  holdBlock?: BlockPosition;
  oldBlocks: BlockPosition[];
  score: number;
  highScore: number;
}>;
