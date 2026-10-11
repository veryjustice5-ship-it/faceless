export interface AccessCode {
  id: string;
  code: string; // e.g. "FACELESS-2026"
  label: string; // e.g. "CS 101 Lecture Hall"
  targetCourse: string; // e.g. "ALL" or "CS 101"
  createdAt: string;
  expiresAt?: string;
  maxUses: number; // 0 for unlimited
  usedCount: number;
  isActive: boolean;
  createdBy: string; // "Admin (Prof. Vance)"
}

export interface AuthSession {
  isAuthenticated: boolean;
  accessCodeUsed?: string;
  authenticatedAt?: string;
  isAdmin: boolean;
  assignedCourse?: string;
}
