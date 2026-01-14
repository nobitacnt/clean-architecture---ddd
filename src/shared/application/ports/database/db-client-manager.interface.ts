import { DatabaseRole } from "@/shared/common/const";

export interface IDBClientManager {
  /**
   * Get the client instance
   */
  getClient(role: DatabaseRole): Promise<any>;
}
