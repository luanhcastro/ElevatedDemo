import type { Agency, CreateAgencyInput, UpdateAgencyInput } from "./types";

export interface AgencyRepository {
  list(): Promise<Agency[]>;
  create(input: CreateAgencyInput): Promise<Agency>;
  update(id: string, input: UpdateAgencyInput): Promise<Agency>;
  deactivate(id: string): Promise<Agency>;
}
