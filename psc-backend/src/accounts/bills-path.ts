import * as path from 'path';

const PRODUCTION_BILLS_ROOT = '/psc/portal/data/bills';

export function getBillsRoot() {
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_BILLS_ROOT;
  }

  return path.join(process.cwd(), 'data', 'bills');
}
