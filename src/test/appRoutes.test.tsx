import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("App route declarations", () => {
  const appPath = path.resolve(process.cwd(), "src/App.tsx");
  const appSource = fs.readFileSync(appPath, "utf8");

  it("keeps /transparency as a public route", () => {
    expect(appSource).toContain('<Route path="/transparency" element={<Transparency />} />');
  });

  it("wraps /lobby with ProtectedRoute requireTrust", () => {
    expect(appSource).toContain(
      '<Route path="/lobby" element={<ProtectedRoute requireTrust><Lobby /></ProtectedRoute>} />',
    );
  });

  it("supports both legacy and param-based appeal routes", () => {
    expect(appSource).toContain('<Route path="/appeal" element={<ProtectedRoute><Appeal /></ProtectedRoute>} />');
    expect(appSource).toContain('<Route path="/appeal/:flagId" element={<ProtectedRoute><Appeal /></ProtectedRoute>} />');
  });
});
