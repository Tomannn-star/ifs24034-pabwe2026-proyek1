import { describe, test, expect } from "vitest";
import * as services from "./services/index.js";

describe("Library Services Index Exports", () => {
  test("services index mengekspor seluruh service modular", () => {
    expect(services.authService).toBeDefined();
    expect(services.categoryService).toBeDefined();
    expect(services.duesService).toBeDefined();
    expect(services.assertBendahara).toBeDefined();
    expect(services.memberService).toBeDefined();
    expect(services.tokenService).toBeDefined();
    expect(services.transactionService).toBeDefined();
  });
});

