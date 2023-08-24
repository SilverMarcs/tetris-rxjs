# Assignment 1

## Usage

Setup (requires node.js):

```
> npm install
```

Start tests:

```
> npm test
```

Serve up the App (and ctrl-click the URL that appears in the console)

```
> npm run dev
```

## Definitions:

`Cube` is a 1x1 object <br>

`Block` is an object made up of 4 cubes in any tetris shape <br>

`Rotation` system used is a partial Super Rotation System (SRS) where it is possible to rotate a block 90 degrees clockwise

## Game Rules:

- The game is over when a block reaches the top of the game board
- 100 points are awarded for each row cleared
- The game speed increases after reaching 200 score
- The game restarts automatically after showing game over box for three seconds
- Highscore is tracked until page is refreshed
- Highscore is only updated at the end of the current round

_factors like game speed, difficulty based on score, scoring etc. can be tweaked in the constants.ts file_

## Game Controls:

- `A` button: Move block left
- `D` button: Move block right
- `Enter` button: rotate block clockwise
