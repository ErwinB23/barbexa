// A runtime may suppress returns owned by a separate diagnostic Auth profile.
export interface AuthReturnFence {
  allow(): Promise<boolean>;
  localFlowStarted(): Promise<void>;
}
