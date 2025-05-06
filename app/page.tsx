'use client';

  import { useSession, signIn, signOut } from "next-auth/react";
  import { useRouter } from "next/navigation";

  export default function HomePage() {
    const { data: session } = useSession();
    const router = useRouter();

    if (session) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>採用スクリーニングシステム</h1>
          <p>ようこそ、{session.user?.name}さん！</p>
          <button onClick={() => router.push('/upload')}>履歴書をアップロード</button>
          <button onClick={() => signOut()}>ログアウト</button>
        </div>
      );
    }
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>採用スクリーニングシステム</h1>
        <p>ログインして進めてください。</p>
        <button onClick={() => signIn("google")}>Googleでログイン</button>
        <button onClick={() => signIn("github")}>GitHubでログイン</button>
      </div>
    );
  }