export interface ITransactionClient {
  execute<T>(work: () => Promise<T>): Promise<T>;
}