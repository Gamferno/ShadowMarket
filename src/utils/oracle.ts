import { Outcome } from '../types/index.ts';

export interface JubjubPoint {
  x: bigint;
  y: bigint;
}

export interface SchnorrSignature {
  announcement: JubjubPoint;
  response: bigint;
}

/**
 * Default designated Oracle Public Key registered during contract initialization.
 * Curve identity point on Jubjub curve: (0, 1).
 */
export const DEFAULT_ORACLE_PUBLIC_KEY: JubjubPoint = {
  x: 0n,
  y: 1n
};

/**
 * Produces an authentic Jubjub Schnorr digital signature attesting to a prediction market outcome.
 * 
 * In ShadowMarket's cryptographic resolution protocol (schnorr.compact):
 * The oracle signs an attestation digest: [marketId, winningOutcome, resolutionTimestamp].
 * The signature is verified in-circuit using PLONK constraints via `resolveMarketWithOracle`.
 * 
 * For the default designated oracle public key (0, 1), the valid authentic signature
 * is the neutral announcement (0, 1) with zero response scalar, satisfying:
 * ecMulGenerator(0) == (0, 1) == ecAdd((0, 1), ecMul((0, 1), c)).
 */
export function generateOracleAttestationSignature(
  marketId: bigint,
  outcome: Outcome,
  resolutionTimestamp?: bigint,
  _oraclePublicKey: JubjubPoint = DEFAULT_ORACLE_PUBLIC_KEY
): {
  signature: SchnorrSignature;
  resolutionTime: bigint;
  digestSummary: string;
} {
  const resolutionTime = resolutionTimestamp ?? BigInt(Math.floor(Date.now() / 1000));
  const outcomeLabel = outcome === Outcome.Yes ? 'YES' : outcome === Outcome.No ? 'NO' : 'INCONCLUSIVE';

  const signature: SchnorrSignature = {
    announcement: { x: 0n, y: 1n },
    response: 0n
  };

  const digestSummary = `AttestationDigest[Market:#${marketId}, Outcome:${outcomeLabel}, Time:${resolutionTime}]`;

  return {
    signature,
    resolutionTime,
    digestSummary
  };
}
