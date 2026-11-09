import type { CreateUserInput, UpdateUserInput, User } from "./types";

export interface UserRepository {
  list(): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  deactivate(id: string): Promise<User>;
}
