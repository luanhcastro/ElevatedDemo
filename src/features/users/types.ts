export type UserStatus = 'active' | 'inactive';
export type AgencyRole = 'agency_admin' | 'member';
export type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  agencyName: string;
  role: AgencyRole;
  createdAt: string;
};
export type CreateUserInput = Pick<User, 'name' | 'email' | 'role'> & { password: string };
export type UpdateUserInput = Pick<User, 'name' | 'email'>;
