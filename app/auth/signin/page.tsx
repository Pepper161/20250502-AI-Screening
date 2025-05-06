'use client';

   import { signIn } from "next-auth/react";

   export default function SignInPage() {
     return (
       <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
         <h1>ログイン</h1>
         <button onClick={() => signIn("google")}>Googleでログイン</button>
         <button onClick={() => signIn("github")}>GitHubでログイン</button>
       </div>
     );
   }