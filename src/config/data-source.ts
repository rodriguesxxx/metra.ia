import "server-only";

/** Mocks são opt-in e destinados somente a desenvolvimento/demonstração. */
export const isMockDataEnabled = () => process.env.METRA_DATA_SOURCE === "mock";
