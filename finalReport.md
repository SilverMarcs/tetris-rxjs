For definitions of elements in the game as well as playing instructions, please refer to README.MD

The Tetris-like game was developed using a functional reactive programming (FRP) style with TypeScript and RxJS. The design decisions and functional programming techniques used are discussed below:

Pure Functions:
The code heavily relies on pure functions, which are deterministic functions that always produce the same output for the same input and have no side effects. This makes the code easier to reason about, test, and debug. For example, the generateBlock function generates a new block for the game based on the current block and next block. It doesn't modify any external state or produce any side effects. Another example of a pure function is the rotate function. This function takes a block as input and returns a new block that is a rotated version of the input block. Since this function is pure, it doesn't have any side effects or modify any external state. This makes it easy to test and debug, as we can be sure that the function will always return the same output for the same input. Moreover, since the function doesn't modify the input block, we can use the original block elsewhere in the code without worrying about it being altered by the rotate function.

Currying:
Currying was used to create functions that can be partially applied. This is evident in the hasObjectCollided function. This function accepts a direction as its first argument and returns another function that expects the object position. This returned function, when invoked with the object position, gives us yet another function that expects an array of old objects. Here, it was possible to create hasObjectCollidedDown, hasObjectCollidedLeft, hasObjectCollidedRight functions by passsing in direction first and use these specialized functions in othe rplaces

Observables:
RxJS Observables were used to handle asynchronous events like user inputs and game ticks. For example, the movement$ Observable merges multiple key press events and maps them to game movements. The game$ Observable uses the expand operator to recursively update the game state based on game ticks and user inputs.

State Management:
The game state is managed in a purely functional way. The State type is defined as a readonly type, which means it can't be mutated. Instead, new states are created from old states using pure functions. This makes the state predictable and easy to manage.

Generics:
Generics were used to create reusable and flexible types and functions. For example, the Position type is a generic type that can represent a position with any type of coordinates.

High Order Functions:
High order functions, which are functions that return other functions, were used extensively. The createMoveBlockAction function is a higher-order function that returns a new function based on the parameters provided. This function takes a direction and a boundary check function as parameters and returns a new function that can move a block in the specified direction if it doesn't hit the boundary or any other blocks. This function is used to create the moveBlockLeft and moveBlockRight functions, reducing code duplication and improving code reusability. By using this approach, we can easily create new functions to move the block in any direction without having to write the same logic over and over again.

Reactive Programming:
The game logic is implemented in a reactive way. The game state is updated in response to events like game ticks and user inputs. This is done by consuming the steady stream of keyboard input as well as the steady stream of game's own mechanism via the tick$ observable

Functional Composition:
Functional composition was used to create complex functions from simpler ones. This is evident in functions like clearFullRows, which is composed of several other functions.

Additional feature (Holding Block):
The feature is such that it allows the player to hold a block and swap it with the current block. This will allow the player to save a block for a more opportune time. This can be used in the current loop of the game or can be stored for another loop.

So, in the context of the game we are implementing, the current block that is falling can be held. Once a block is held, it remains in the hold area until the player decides to swap it with the current block.

At the moment, the player needs to remember which block is in the hold area. This is because the hold area is not displayed on the game board for raising skill gap.
