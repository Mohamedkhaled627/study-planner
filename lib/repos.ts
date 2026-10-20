import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "./db";
import { DomainError } from "./errors";

export type Priority = "LOW" | "MED" | "HIGH";
export type TaskStatus = "TODO" | "DOING" | "DONE" | "SKIPPED";
export interface TaskDoc {
  id: string;
  subjectId: string;
  title: string;
  deadline: string | null;
  priority: Priority;
  estimatedMin: number;
  status: TaskStatus;
}
export interface SubjectDoc {
  id: string;
  name: string;
  color: string;
  examDate: string | null;
}
export interface ResourceDoc {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  type: string;
}

const iso = (d?: Date | null) => (d ? d.toISOString() : null);
const unwrap = <T>(s: QueryDocumentSnapshot<DocumentData>) => ({ id: s.id, ...s.data() }) as T;

async function ownSubject(userId: string, subjectId: string) {
  const s = await getDoc(doc(db, "subjects", subjectId));
  if (!s.exists() || s.data().userId !== userId) throw new DomainError("Forbidden");
  return s;
}

export const subjectRepo = {
  create: (userId: string, data: { name: string; color: string; examDate?: Date }) =>
    addDoc(collection(db, "subjects"), {
      ...data,
      examDate: iso(data.examDate),
      userId,
      createdAt: serverTimestamp(),
    }),
  list: async (userId: string): Promise<SubjectDoc[]> =>
    (await getDocs(query(collection(db, "subjects"), where("userId", "==", userId)))).docs.map(
      (s) => ({ id: s.id, ...s.data(), examDate: s.data().examDate ?? null })
    ) as SubjectDoc[],
};

export const taskRepo = {
  create: async (
    userId: string,
    data: {
      subjectId: string;
      title: string;
      deadline?: Date | null;
      priority: Priority;
      estimatedMin: number;
    }
  ) => {
    await ownSubject(userId, data.subjectId);
    return addDoc(collection(db, "tasks"), {
      ...data,
      deadline: iso(data.deadline),
      status: "TODO",
      userId,
      createdAt: serverTimestamp(),
    });
  },
  list: async (userId: string, status?: string): Promise<TaskDoc[]> => {
    const q = status
      ? query(collection(db, "tasks"), where("userId", "==", userId), where("status", "==", status))
      : query(collection(db, "tasks"), where("userId", "==", userId));
    return (await getDocs(q)).docs.map(unwrap<TaskDoc>);
  },
  async patch(userId: string, id: string, data: Record<string, unknown>) {
    const t = await getDoc(doc(db, "tasks", id));
    if (!t.exists() || t.data().userId !== userId) throw new DomainError("NotFound");
    const patch: Record<string, unknown> = { ...data };
    if ("deadline" in data) patch.deadline = iso(data.deadline as Date | null | undefined);
    await updateDoc(doc(db, "tasks", id), patch);
    return { id, ...t.data(), ...patch };
  },
};

export const resourceRepo = {
  create: async (
    userId: string,
    data: { subjectId: string; title: string; url: string; type: string }
  ) => {
    await ownSubject(userId, data.subjectId);
    return addDoc(collection(db, "resources"), { ...data, userId, createdAt: serverTimestamp() });
  },
  list: async (userId: string, subjectId?: string): Promise<ResourceDoc[]> => {
    const q = subjectId
      ? query(collection(db, "resources"), where("userId", "==", userId), where("subjectId", "==", subjectId))
      : query(collection(db, "resources"), where("userId", "==", userId));
    return (await getDocs(q)).docs.map(unwrap<ResourceDoc>);
  },
  async remove(userId: string, id: string) {
    const r = await getDoc(doc(db, "resources", id));
    if (!r.exists() || r.data().userId !== userId) throw new DomainError("NotFound");
    await deleteDoc(doc(db, "resources", id));
  },
};

export const availabilityRepo = {
  replaceAll: async (
    userId: string,
    slots: { weekday: number; startMin: number; endMin: number }[]
  ) => {
    await setDoc(doc(db, "availability", userId), { userId, slots });
    return slots;
  },
  list: async (userId: string) => {
    const snap = await getDoc(doc(db, "availability", userId));
    return (snap.data()?.slots ?? []) as { weekday: number; startMin: number; endMin: number }[];
  },
};
