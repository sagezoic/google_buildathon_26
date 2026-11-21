import { AbiCoder, keccak256, toUtf8Bytes } from 'ethers';
import { env } from '../../config/env';
import { unprocessable } from '../../lib/errors';
import type { Property } from '../../db/schema';

const norm = (s: string | null | undefined) =>
  (s ?? '').normalize('NFKD').toUpperCase().replace(/[^A-Z0-9/]+/g, '-').replace(/^-+|-+$/g, '');

/** Jurisdiction + parcel from the land identifiers (Maharashtra: district / taluka / village + gat or survey no.). */
export function parcelKey(p: Pick<Property, 'district' | 'taluka' | 'village' | 'gat' | 'address'>) {
  const parcel = norm(p.gat) || norm(p.address);
  const place = [p.district, p.taluka, p.village].map(norm).filter(Boolean);
  if (!parcel || place.length === 0) {
    throw unprocessable('A property needs a gat or address plus district, taluka or village before it can be anchored.');
  }
  return { jurisdiction: `IN-MH-${place.join('-')}`, parcel };
}

/** Same derivation as PropertyRegistry.propertyIdOf: keccak256(abi.encode(jurisdiction, parcel)) as uint256. */
export function propertyIdOf(jurisdiction: string, parcel: string): { hex: string; token: string } {
  const h = keccak256(AbiCoder.defaultAbiCoder().encode(['string', 'string'], [jurisdiction, parcel]));
  return { hex: h, token: BigInt(h).toString() };
}

/** Salted so the on-chain value cannot be reversed to a name, and differs per property. */
export const ownerRefOf = (ownerName: string, propertyId: string) =>
  keccak256(toUtf8Bytes(`${env.CHAIN_OWNER_SALT}|${propertyId}|${ownerName.normalize('NFKC').trim().toLowerCase()}`));
