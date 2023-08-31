import { BehaviorSubject, Observable, fromEvent, interval, merge } from "rxjs";
import { filter, map, scan, switchMap, throttleTime } from "rxjs/operators";
import { Constants } from "./constants";
import { gameActions, initialState } from "./game";
import { getTickRate } from "./generics";
import { GameEvent, Key, State } from "./types";

// Create an observable for keydown events
export const key$ = fromEvent<KeyboardEvent>(document, "keydown");

// function to filter keydown events by key code
const fromKey = (keyCode: Key) =>
  filter((e: KeyboardEvent) => e.code === keyCode);

export const left$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyA"),
  map(() => "Left")
);

export const right$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyD"),
  map(() => "Right")
);
export const down$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyS"),
  map(() => "Down")
);

export const rotateClockwise$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyE"),
  map(() => "RotateClockwise")
);

export const rotateAntiClockwise$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyQ"),
  map(() => "RotateAntiClockwise")
);

export const hold$: Observable<GameEvent> = key$.pipe(
  fromKey("KeyH"),
  map(() => "Hold")
);

// Merge all user action observables into one
export const userAction$ = merge(
  left$,
  right$,
  down$,
  rotateClockwise$,
  rotateAntiClockwise$,
  hold$
);

// Create a score$ observable that emits the current score
export const score$ = new BehaviorSubject<number>(initialState.score);

// Create a tick$ observable that adjusts the tick rate based on the current score
export const tick$ = score$.pipe(
  switchMap((score) => interval(getTickRate(score))),
  map(() => "Tick" as GameEvent)
);

// Merge the throttled user actions with the tick$ observable
export const game$ = merge(userAction$, tick$).pipe(
  scan((state: State, event: GameEvent) => {
    const updatedState = gameActions[event](state);
    return updatedState;
  }, initialState)
);
