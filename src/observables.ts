import { BehaviorSubject, Observable, fromEvent, interval, merge } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  switchMap,
} from "rxjs/operators";
import { gameActions, initialState } from "./game";
import { getTickRate } from "./generics";
import { GameEvent, Key, State } from "./types";

// Create an observable for keydown events
const key$ = fromEvent<KeyboardEvent>(document, "keydown");

// function to filter keydown events by key code
const fromKey = (keyCode: Key) =>
  filter((e: KeyboardEvent) => e.code === keyCode);

const left$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyA"),
  map(() => "Left")
);

const right$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyD"),
  map(() => "Right")
);
const down$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyS"),
  map(() => "Down")
);

const rotateClockwise$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyE"),
  map(() => "RotateClockwise")
);

const rotateAntiClockwise$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyQ"),
  map(() => "RotateAntiClockwise")
);

const hold$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyH"),
  map(() => "Hold")
);

const restart$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyR"),
  map(() => "Restart")
);

// Merge all user action observables into one
const userAction$: Observable<GameEvent> = merge(
  left$,
  right$,
  down$,
  rotateClockwise$,
  rotateAntiClockwise$,
  hold$,
  restart$
);

// Create a score$ observable that emits the current score
export const score$ = new BehaviorSubject<number>(initialState.score);

// Create a distinctScore$ observable that emits the current score only when it changes
export const distinctScore$ = score$.pipe(distinctUntilChanged());

// Create a tick$ observable that adjusts the tick rate based on the current score
export const tick$ = distinctScore$.pipe(
  switchMap((score) => interval(getTickRate(score))),
  map(() => "Tick" as GameEvent)
);

export const game$ = merge(userAction$, tick$).pipe(
  scan((state: State, event: GameEvent) => {
    return gameActions[event](state);
  }, initialState)
);
