import type { AgencyRepository } from '@/features/agencies/repository';
import type { Agency, CreateAgencyInput, UpdateAgencyInput } from '@/features/agencies/types';
import type { UserRepository } from '@/features/users/repository';
import type { CreateUserInput, UpdateUserInput, User } from '@/features/users/types';
import { mockAgencies, mockUsers } from './data';

const latency = () => new Promise((resolve) => setTimeout(resolve, 350));

export function createMockAgencyRepository(seed: Agency[] = mockAgencies): AgencyRepository {
  let agencies = structuredClone(seed);
  return {
    async list() {
      await latency();
      return structuredClone(agencies);
    },
    async create(input: CreateAgencyInput) {
      await latency();
      const agency: Agency = {
        id: crypto.randomUUID(),
        ...input,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      agencies = [agency, ...agencies];
      return structuredClone(agency);
    },
    async update(id: string, input: UpdateAgencyInput) {
      await latency();
      const current = agencies.find((agency) => agency.id === id);
      if (!current) throw new Error('Agency not found');
      const updated = { ...current, ...input };
      agencies = agencies.map((agency) => (agency.id === id ? updated : agency));
      return structuredClone(updated);
    },
    async deactivate(id: string) {
      await latency();
      const current = agencies.find((agency) => agency.id === id);
      if (!current) throw new Error('Agency not found');
      const updated: Agency = { ...current, status: 'inactive' };
      agencies = agencies.map((agency) => (agency.id === id ? updated : agency));
      return structuredClone(updated);
    },
  };
}

export function createMockUserRepository(seed: User[] = mockUsers): UserRepository {
  let users = structuredClone(seed);
  return {
    async list() {
      await latency();
      return structuredClone(users);
    },
    async create(input: CreateUserInput) {
      await latency();
      const user: User = {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        agencyName: 'Northstar Creative',
        role: input.role,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      users = [user, ...users];
      return structuredClone(user);
    },
    async update(id: string, input: UpdateUserInput) {
      await latency();
      const current = users.find((user) => user.id === id);
      if (!current) throw new Error('User not found');
      const updated = { ...current, ...input };
      users = users.map((user) => (user.id === id ? updated : user));
      return structuredClone(updated);
    },
    async deactivate(id: string) {
      await latency();
      const current = users.find((user) => user.id === id);
      if (!current) throw new Error('User not found');
      const updated: User = { ...current, status: 'inactive' };
      users = users.map((user) => (user.id === id ? updated : user));
      return structuredClone(updated);
    },
  };
}
