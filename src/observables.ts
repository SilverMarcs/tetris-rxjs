import { BehaviorSubject, Observable, fromEvent, interval, merge } from "rxjs";
import { filter, map, scan, switchMap } from "rxjs/operators";
import { gameActions, initialState } from "./game";
import { getTickRate } from "./generics"; // replace with actual module path
import { Event, Key, State } from "./types"; // replace with actual module path

// Create an observable for keydown events
export const key$ = fromEvent<KeyboardEvent>(document, "keydown");

// function to filter keydown events by key code
const fromKey = (keyCode: Key) =>
  filter((e: KeyboardEvent) => e.code === keyCode);

export const left$: Observable<Event> = key$.pipe(
  fromKey("KeyA"),
  map(() => "Left")
);

export const right$: Observable<Event> = key$.pipe(
  fromKey("KeyD"),
  map(() => "Right")
);
export const down$: Observable<Event> = key$.pipe(
  fromKey("KeyS"),
  map(() => "Down")
);

export const rotateClockwise$: Observable<Event> = key$.pipe(
  fromKey("KeyE"),
  map(() => "RotateClockwise")
);

export const rotateAntiClockwise$: Observable<Event> = key$.pipe(
  fromKey("KeyQ"),
  map(() => "RotateAntiClockwise")
);

export const hold$: Observable<Event> = key$.pipe(
  fromKey("KeyH"),
  map(() => "Hold")
);

// Merge all movement observables into one
export const movements$ = merge(
  left$,
  right$,
  down$,
  rotateClockwise$,
  rotateAntiClockwise$,
  hold$
);

// Create observables for score. need to use BehaviorSubjects to have access to current score in order to update the tick rate observable
export const score$ = new BehaviorSubject(initialState.score);

// Create a stream of ticks and/or game speed based on the score
export const tick$ = score$.pipe(
  switchMap((score) => interval(getTickRate(score))),
  map(() => "Tick" as Event)
);

export const game$ = merge(movements$, tick$).pipe(
  scan((state: State, event: Event) => {
    const newState = gameActions[event](state);
    if (state.gameEnd) {
      // we need to do this so as to let the render function know that the game has ended to show a game over banner
      const updatedState = { ...newState, gameEnd: false };
      return updatedState;
    }
    return newState;
  }, initialState)
);
