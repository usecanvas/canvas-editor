import UUID from 'uuid';
import Base62 from 'base62';

/**
 * A module for generating Base62-encoded v4 UUIDs
 * @module Base62UUID
 */

const LENGTH = 22;

/**
 * @function
 * @returns {string} A base62-encoded v4 UUID
 */
export function generate() {
  const uuid = UUID.generate().replace(/-/g, '');
  const int = parseInt(uuid, 16);
  const baseID = Base62.encode(int);
  return ensureLength(baseID);
}

function ensureLength(baseID) {
  if (baseID.length === LENGTH) return baseID;
  const diff = LENGTH - baseID.length;
  return `${'0'.repeat(diff)}${baseID}`;
}
