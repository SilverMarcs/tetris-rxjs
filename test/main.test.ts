import { assert, describe, expect, it } from "vitest";
import { main } from "../src/main";

describe("main", () => {
  it("is defined", () => {
    assert.isDefined(main);
  });
  it("is a function", () => {
    assert.isFunction(main);
  });
});
