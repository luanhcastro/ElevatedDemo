export type UserStatus = "active" | "inactive";
export type User = { id: string; name: string; email: string; status: UserStatus; agencyName: string; createdAt: string };
export type CreateUserInput = Pick<User, "name" | "email"> & { password: string };
export type UpdateUserInput = Pick<User, "name" | "email">;
