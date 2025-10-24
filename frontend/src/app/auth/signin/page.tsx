"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow">
        <h1 className="text-2xl font-bold text-white text-center">Sign in</h1>
        <p className="mt-2 text-slate-400 text-center">
          Continue with your Google account to connect your YouTube channel.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="inline-flex items-center justify-center gap-3 rounded-md bg-white text-slate-900 py-3 px-4 font-semibold hover:bg-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.377,6.053,28.877,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.377,6.053,28.877,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c4.777,0,9.149-1.833,12.479-4.826l-5.753-4.864C29.711,35.477,26.973,36.5,24,36.5 c-5.202,0-9.619-3.317-11.281-7.946l-6.513,5.02C9.5,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.102,5.61c0.001-0.001,0.002-0.001,0.003-0.002 l6.513,5.02C36.493,38.017,44,32,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
            Continue with Google
          </button>
        </div>
        <p className="mt-6 text-xs text-slate-500 text-center">
          By signing in you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
