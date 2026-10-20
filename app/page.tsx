import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 32 }}>
      <h1>Study Planner for CS Students</h1>
      <p>Sign up → add subjects/tasks/availability → Generate → see your week.</p>
      <Link href="/login">Login</Link> · <Link href="/planner">Planner</Link>
    </main>
  );
}
