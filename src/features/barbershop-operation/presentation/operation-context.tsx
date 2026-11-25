import { createContext, useContext } from 'react';
import type { OperationApplication } from '../application/operation-application';
import { BusinessError } from '../domain/values';
export const OperationContext = createContext<OperationApplication | null>(
  null,
);
export function useOperation() {
  const app = useContext(OperationContext);
  if (!app) throw new BusinessError('DEPENDENCY_UNAVAILABLE');
  return app;
}
