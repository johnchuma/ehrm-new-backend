import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  companyId: string | null;
  bypassRls: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export function getTenantContext(): TenantStore {
  return tenantStorage.getStore() ?? { companyId: null, bypassRls: false };
}
