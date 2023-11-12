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
// distinctUntilChanged is an operator in RxJS that filters out consecutive duplicate values in an Observable. It only emits a value if it is different from the previous value
export const distinctScore$ = score$.pipe(distinctUntilChanged());

// Create a tick$ observable that adjusts the tick rate based on the current score
// switchMap is an operator that is used to transform the items emitted by an Observable into Observables, and then mirror the emissions from the most recently transformed Observable. It is similar to mergeMap and concatMap, but it cancels the previous inner Observable when a new one is emitted.
export const tick$ = distinctScore$.pipe(
  switchMap((score) => interval(getTickRate(score))),
  map(() => "Tick" as GameEvent)
);

export const game$ = merge(userAction$, tick$).pipe(
  scan((state: State, event: GameEvent) => {
    return gameActions[event](state);
  }, initialState)
);
