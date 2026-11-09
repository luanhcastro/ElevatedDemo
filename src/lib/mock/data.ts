import type { Agency } from "@/features/agencies/types";
import type { User } from "@/features/users/types";

export const mockAgencies: Agency[] = [
  { id: "agency-northstar", name: "Northstar Creative", email: "hello@northstar.example", status: "active", createdAt: "2026-10-28T14:00:00Z" },
  { id: "agency-meridian", name: "Meridian Partners", email: "ops@meridian.example", status: "active", createdAt: "2026-10-21T10:30:00Z" },
  { id: "agency-summit", name: "Summit Digital", email: "team@summit.example", status: "active", createdAt: "2026-10-12T18:45:00Z" },
  { id: "agency-harbor", name: "Harbor & Co.", email: "contact@harbor.example", status: "inactive", createdAt: "2026-09-30T09:15:00Z" },
];

export const mockUsers: User[] = [
  { id: "user-maya", name: "Maya Chen", email: "maya.chen@northstar.example", agencyName: "Northstar Creative", status: "active", createdAt: "2026-11-06T13:20:00Z" },
  { id: "user-jordan", name: "Jordan Ellis", email: "jordan@meridian.example", agencyName: "Meridian Partners", status: "active", createdAt: "2026-11-03T16:05:00Z" },
  { id: "user-priya", name: "Priya Kapoor", email: "priya@summit.example", agencyName: "Summit Digital", status: "active", createdAt: "2026-10-29T11:40:00Z" },
  { id: "user-theo", name: "Theo Martin", email: "theo@northstar.example", agencyName: "Northstar Creative", status: "inactive", createdAt: "2026-10-18T08:10:00Z" },
  { id: "user-amara", name: "Amara Okafor", email: "amara@harbor.example", agencyName: "Harbor & Co.", status: "active", createdAt: "2026-10-09T12:00:00Z" },
  { id: "user-luis", name: "Luis Romero", email: "luis@meridian.example", agencyName: "Meridian Partners", status: "active", createdAt: "2026-09-27T19:25:00Z" },
];
