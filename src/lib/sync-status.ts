export interface SyncStatus {
  status: "never" | "success" | "error" | "syncing";
  lastSuccessfulSyncAt?: string;
  attemptedAt?: string;
  message?: string;
}
