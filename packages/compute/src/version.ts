/**
 * Compute versioning contract
 *
 * - COMPUTE_SEMVER: stable semantic version for compatibility checks.
 * - COMPUTE_VERSION: build identifier that may include pre-release/build metadata.
 *
 * Determinism note: version values are constants (no env reads) in Sprint 10.
 */
export const COMPUTE_SEMVER = "10.0.0" as const;

// Keep dev marker explicit until AGENT-002.1 wires git SHA at build time.
export const COMPUTE_VERSION = "10.0.0-dev" as const;
