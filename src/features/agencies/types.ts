export type AgencyStatus = 'active' | 'inactive';
export type Agency = {
  id: string;
  name: string;
  email: string;
  status: AgencyStatus;
  createdAt: string;
};
export type CreateAgencyInput = Pick<Agency, 'name' | 'email'>;
export type UpdateAgencyInput = Pick<Agency, 'name' | 'email'>;
