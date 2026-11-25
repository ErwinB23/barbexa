// Shared application projection; neither coordinator depends on the other's implementation.
export interface OperationScope {
  readonly userId: string;
  readonly generation: number;
  readonly barbershopId?: string;
  readonly role?: 'administrator' | 'barber';
}
