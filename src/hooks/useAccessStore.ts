import { useState, useEffect, useCallback } from 'react';
import { AccessCode, AuthSession } from '../types/auth';

const CODES_STORAGE_KEY = 'faceless_access_codes_v2';
const SESSION_STORAGE_KEY = 'faceless_auth_session_v2';

export const ADMIN_MASTER_PIN = 'Justice*2233';

const INITIAL_CODES: AccessCode[] = [
  {
    id: 'code-1',
    code: 'FACELESS-2026',
    label: 'Campus Quad General Pass',
    targetCourse: 'ALL',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    maxUses: 200,
    usedCount: 48,
    isActive: true,
    createdBy: 'Campus Admin',
  },
  {
    id: 'code-2',
    code: 'CS101-FALL',
    label: 'Intro to Algorithms Section Pass',
    targetCourse: 'CS 101',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    maxUses: 60,
    usedCount: 29,
    isActive: true,
    createdBy: 'Prof. Vance (CS 101)',
  },
  {
    id: 'code-3',
    code: 'BIO-PASS',
    label: 'Bio Lab 105 Study Group',
    targetCourse: 'BIO 105',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    maxUses: 35,
    usedCount: 14,
    isActive: true,
    createdBy: 'Head TA Sarah',
  },
];

export function useAccessStore() {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [session, setSession] = useState<AuthSession>({
    isAuthenticated: false,
    isAdmin: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load codes and session
  useEffect(() => {
    // 1. Load codes
    const storedCodes = localStorage.getItem(CODES_STORAGE_KEY);
    if (storedCodes) {
      try {
        const parsed = JSON.parse(storedCodes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAccessCodes(parsed);
        } else {
          setAccessCodes(INITIAL_CODES);
          localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(INITIAL_CODES));
        }
      } catch {
        setAccessCodes(INITIAL_CODES);
        localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(INITIAL_CODES));
      }
    } else {
      setAccessCodes(INITIAL_CODES);
      localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(INITIAL_CODES));
    }

    // 2. Load session
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
      } catch {
        setSession({ isAuthenticated: false, isAdmin: false });
      }
    }

    setIsInitialized(true);
  }, []);

  // Save codes helper
  const saveCodes = (codes: AccessCode[]) => {
    setAccessCodes(codes);
    localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
  };

  // Save session helper
  const saveSession = (sess: AuthSession) => {
    setSession(sess);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sess));
  };

  // Verify student access code ONLY (Students cannot use admin credentials here)
  const loginWithCode = useCallback(
    (inputCode: string): { success: boolean; message?: string } => {
      const clean = inputCode.trim().toUpperCase();

      // Guard: Do not allow admin passwords here
      if (clean === ADMIN_MASTER_PIN.toUpperCase() || clean === 'ADMIN' || clean === 'ADMIN#FACELESS2026') {
        return {
          success: false,
          message: 'Admin credentials cannot be used as student access codes. Please use the Faculty & Admin Portal below.',
        };
      }

      // Check student access codes
      const matched = accessCodes.find((c) => c.code.toUpperCase() === clean);

      if (!matched) {
        return {
          success: false,
          message: 'Invalid access code. Please check with your course admin or instructor.',
        };
      }

      if (!matched.isActive) {
        return {
          success: false,
          message: 'This access code has been deactivated by the instructor.',
        };
      }

      if (matched.maxUses > 0 && matched.usedCount >= matched.maxUses) {
        return {
          success: false,
          message: 'This access code has reached its maximum student usage limit.',
        };
      }

      // Valid student code: increment count
      const updatedCodes = accessCodes.map((c) => {
        if (c.id === matched.id) {
          return { ...c, usedCount: c.usedCount + 1 };
        }
        return c;
      });
      saveCodes(updatedCodes);

      // Authenticate as STUDENT ONLY
      const newSession: AuthSession = {
        isAuthenticated: true,
        isAdmin: false,
        accessCodeUsed: matched.code,
        authenticatedAt: new Date().toISOString(),
        assignedCourse: matched.targetCourse,
      };
      saveSession(newSession);

      return { success: true };
    },
    [accessCodes]
  );

  // Dedicated Admin Authentication with username and password
  const loginAsAdmin = useCallback(
    (username: string, password: string): { success: boolean; message?: string } => {
      const u = username.trim().toLowerCase();
      const p = password.trim();

      // Accept admin usernames e.g. admin, justice, faculty, instructor, or valid faculty handle
      const isValidUser = u === 'admin' || u === 'justice' || u === 'faculty' || u === 'instructor' || u.length >= 3;
      // Admin password updated to [Justice*2233] (supports exact string with or without bracket notation)
      const isValidPass = p === 'Justice*2233' || p === '[Justice*2233]';

      if (!isValidUser || !isValidPass) {
        return {
          success: false,
          message: 'Invalid administrator credentials. Access restricted to authorized faculty.',
        };
      }

      const adminSession: AuthSession = {
        isAuthenticated: true,
        isAdmin: true,
        accessCodeUsed: 'ADMIN-FACULTY',
        authenticatedAt: new Date().toISOString(),
        assignedCourse: 'ALL',
      };
      saveSession(adminSession);

      return { success: true };
    },
    []
  );

  // Logout
  const logout = useCallback(() => {
    const freshSession: AuthSession = {
      isAuthenticated: false,
      isAdmin: false,
    };
    saveSession(freshSession);
  }, []);

  // Admin: Generate new code
  const generateCode = useCallback(
    (params: {
      customCode?: string;
      label: string;
      targetCourse: string;
      maxUses?: number;
      createdBy?: string;
    }): AccessCode => {
      let codeString = params.customCode?.trim().toUpperCase();
      if (!codeString) {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const prefix = params.targetCourse === 'ALL' ? 'QUAD' : params.targetCourse.replace(/\s+/g, '');
        codeString = `${prefix}-${rand}`;
      }

      const newCode: AccessCode = {
        id: 'code-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
        code: codeString,
        label: params.label || 'Class Group Access',
        targetCourse: params.targetCourse || 'ALL',
        createdAt: new Date().toISOString(),
        maxUses: params.maxUses ?? 50,
        usedCount: 0,
        isActive: true,
        createdBy: params.createdBy || 'Class Admin',
      };

      const updated = [newCode, ...accessCodes];
      saveCodes(updated);
      return newCode;
    },
    [accessCodes]
  );

  // Admin: Toggle active / inactive
  const toggleCodeActive = useCallback(
    (codeId: string) => {
      const updated = accessCodes.map((c) => {
        if (c.id === codeId) {
          return { ...c, isActive: !c.isActive };
        }
        return c;
      });
      saveCodes(updated);
    },
    [accessCodes]
  );

  // Admin: Delete code
  const deleteCode = useCallback(
    (codeId: string) => {
      const updated = accessCodes.filter((c) => c.id !== codeId);
      saveCodes(updated);
    },
    [accessCodes]
  );

  // Admin: Toggle admin session directly
  const elevateToAdmin = useCallback(() => {
    saveSession({
      ...session,
      isAdmin: true,
    });
  }, [session]);

  return {
    isInitialized,
    accessCodes,
    session,
    loginWithCode,
    loginAsAdmin,
    logout,
    generateCode,
    toggleCodeActive,
    deleteCode,
    elevateToAdmin,
  };
}
