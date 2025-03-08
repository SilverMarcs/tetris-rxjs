# Tetris RxJS

A simple tetris game built using **RxJS** and **TypeScript**
<br>
Demo [**here**](https://tetris-rxjs.vercel.app)

## Screenshot

<img width="1000" alt="Screenshot 2023-11-28 at 1 09 32 AM" src="https://github.com/SilverMarcs/tetris-rxjs/assets/77480421/28ad51af-2553-4d30-b2d2-647dd0b091ee">


## Usage

Setup (requires node.js):

```
> npm install
```

Serve up the App (and ctrl-click the URL that appears in the console)

```
> npm run dev
```

## Definitions:

`Cube` is a 1x1 object <br>

`Block` is an object made up of 4 cubes in any tetris shape <br>

`Rotation` system used is a Super Rotation System (SRS) where it is possible to rotate a block 90 degrees clockwise or anticlockwise <br>

## File structure

- `constants.ts`: contains constants used in the game
- `game.ts`: contains the game logic
- `types.ts`: contains the types used in the game
- `observables.ts`: sets up the observables used in the game
- `generics.ts` contains generic functions that can be used anywhere where the types are relevant
- `views.ts`: contains the functions that render the game
- `shapes.ts`: contains the functions that generate the various tetris shaped blocks
- `util.ts`: contains utility function(s)
- `main.ts`: contains the main function that runs the game loop

## Game Rules:

- The game is over when a block reaches the top of the game board
- 100 points are awarded for each row cleared
- The game speed increases after reaching 200 score
- The game restarts automatically after showing game over box briefly
- Highscore is tracked until page is refreshed

_factors like game speed, difficulty based on score, scoring etc. can be tweaked in the constants.ts file_

## Game Controls:

- `A` button: Move block left
- `D` button: Move block right
- `S` button: Move block down
- `H` button: Hold the block (more on this in Report)
- `E` button: Rotate block clockwise
- `Q` button: Rotate block anti-clockwise
- `R` button: Restart game
