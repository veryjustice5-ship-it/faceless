import { useState, useEffect, useCallback } from 'react';
import { AccessCode, AuthSession } from '../types/auth';
import { db, handleFirestoreError, OperationType, cleanForFirestore } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';

const CODES_STORAGE_KEY = 'faceless_access_codes_v2';
const SESSION_STORAGE_KEY = 'faceless_auth_session_v2';

export const ADMIN_MASTER_PIN = '[Justice*2233]';

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
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>(INITIAL_CODES);
  const [session, setSession] = useState<AuthSession>({
    isAuthenticated: false,
    isAdmin: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load session from local storage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
      } catch {
        setSession({ isAuthenticated: false, isAdmin: false });
      }
    }
  }, []);

  // REAL-TIME FIRESTORE LISTENER FOR ACCESS CODES
  useEffect(() => {
    const codesCol = collection(db, 'accessCodes');
    const unsubscribe = onSnapshot(
      codesCol,
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial access codes into Firestore
          try {
            for (const c of INITIAL_CODES) {
              await setDoc(doc(db, 'accessCodes', c.id), cleanForFirestore(c));
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, 'accessCodes');
          }
          setAccessCodes(INITIAL_CODES);
        } else {
          const loaded: AccessCode[] = [];
          snapshot.forEach((d) => {
            loaded.push(d.data() as AccessCode);
          });
          setAccessCodes(loaded);
          try {
            localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(loaded));
          } catch {}
        }
        setIsInitialized(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'accessCodes');
        // Offline cache fallback
        const stored = localStorage.getItem(CODES_STORAGE_KEY);
        if (stored) {
          try {
            setAccessCodes(JSON.parse(stored));
          } catch {
            setAccessCodes(INITIAL_CODES);
          }
        } else {
          setAccessCodes(INITIAL_CODES);
        }
        setIsInitialized(true);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save session helper
  const saveSession = (sess: AuthSession) => {
    setSession(sess);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sess));
  };

  // Verify student access code ONLY
  const loginWithCode = useCallback(
    async (inputCode: string): Promise<{ success: boolean; message?: string }> => {
      const clean = inputCode.trim().toUpperCase();

      // Guard: Do not allow admin credentials here
      if (
        clean === '[JUSTICE*2233]' ||
        clean === 'JUSTICE*2233' ||
        clean === 'ADMIN' ||
        clean === 'ADMIN#FACELESS2026'
      ) {
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

      // Valid student code: increment count in Firestore
      const newCount = matched.usedCount + 1;
      setAccessCodes((prev) =>
        prev.map((c) => (c.id === matched.id ? { ...c, usedCount: newCount } : c))
      );

      try {
        await updateDoc(doc(db, 'accessCodes', matched.id), {
          usedCount: newCount,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `accessCodes/${matched.id}`);
      }

      // Authenticate student session
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

  // Dedicated Admin Authentication
  const loginAsAdmin = useCallback(
    (username: string, password: string): { success: boolean; message?: string } => {
      const u = username.trim().toLowerCase();
      const p = password.trim();

      const isValidUser = u === 'admin' || u === 'justice' || u === 'faculty' || u === 'instructor' || u.length >= 3;
      const isValidPass = p === '[Justice*2233]' || p === 'Justice*2233';

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

  // Admin: Generate new code (Sync to Firestore)
  const generateCode = useCallback(
    async (params: {
      customCode?: string;
      label: string;
      targetCourse: string;
      maxUses?: number;
      createdBy?: string;
    }): Promise<AccessCode> => {
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

      setAccessCodes((prev) => [newCode, ...prev]);

      try {
        await setDoc(doc(db, 'accessCodes', newCode.id), cleanForFirestore(newCode));
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `accessCodes/${newCode.id}`);
      }

      return newCode;
    },
    []
  );

  // Admin: Toggle active / inactive (Sync to Firestore)
  const toggleCodeActive = useCallback(
    async (codeId: string) => {
      const target = accessCodes.find((c) => c.id === codeId);
      if (!target) return;
      const nextActive = !target.isActive;

      setAccessCodes((prev) =>
        prev.map((c) => (c.id === codeId ? { ...c, isActive: nextActive } : c))
      );

      try {
        await updateDoc(doc(db, 'accessCodes', codeId), cleanForFirestore({ isActive: nextActive }));
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `accessCodes/${codeId}`);
      }
    },
    [accessCodes]
  );

  // Admin: Delete code (Sync to Firestore)
  const deleteCode = useCallback(
    async (codeId: string) => {
      setAccessCodes((prev) => prev.filter((c) => c.id !== codeId));

      try {
        await deleteDoc(doc(db, 'accessCodes', codeId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `accessCodes/${codeId}`);
      }
    },
    []
  );

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
  };
}
