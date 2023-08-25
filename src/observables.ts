import { BehaviorSubject, Observable, fromEvent, interval, merge } from "rxjs";
import {
  filter,
  map,
  repeat,
  scan,
  switchMap,
  takeWhile,
  tap,
  withLatestFrom,
} from "rxjs/operators";
import { gameActions, initialState } from "./game";
import { getTickSpeed } from "./generics"; // replace with actual module path
import { Key, Movement, State } from "./types"; // replace with actual module path

// Create an observable for keydown events
export const key$ = fromEvent<KeyboardEvent>(document, "keydown");

// function to filter keydown events by key code
const fromKey = (keyCode: Key) =>
  filter((e: KeyboardEvent) => e.code === keyCode);

export const left$: Observable<Movement> = key$.pipe(
  fromKey("KeyA"),
  map((_) => "Left")
);

export const right$: Observable<Movement> = key$.pipe(
  fromKey("KeyD"),
  map((_) => "Right")
);

export const rotateClockwise$: Observable<Movement> = key$.pipe(
  fromKey("KeyE"),
  map((_) => "RotateClockwise")
);

export const rotateAntiClockwise$: Observable<Movement> = key$.pipe(
  fromKey("KeyQ"),
  map((_) => "RotateAntiClockwise")
);

export const hold$: Observable<Movement> = key$.pipe(
  fromKey("KeyH"),
  map((_) => "Hold")
);

// Merge all movement observables into one
export const movements$ = merge(
  left$,
  right$,
  rotateClockwise$,
  rotateAntiClockwise$,
  hold$
);

// Create observables for the high score and score. need to use BehaviorSubjects so that we need to extract the values from the state
export const highScore$ = new BehaviorSubject(0);
export const score$ = new BehaviorSubject(0);

// Create a stream of ticks and/or game speed based on the score
export const tick$ = score$.pipe(
  switchMap((score) => interval(getTickSpeed(score))),
  map(() => "Down" as Movement)
);

export const game$ = merge(movements$, tick$).pipe(
  scan(
    (state: State, event: Movement) => gameActions[event](state),
    initialState
  ),
  tap((state: State) => {
    if (state.gameEnd && state.score > highScore$.value) {
      highScore$.next(state.score);
    }
    score$.next(state.score);
  }),
  takeWhile((state: State) => !state.gameEnd, true),
  repeat({ delay: 3000 }),
  withLatestFrom(highScore$, (state, highScore) => ({ ...state, highScore }))
);
