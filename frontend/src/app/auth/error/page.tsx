"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const messages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You did not grant the required permissions.",
  Verification: "The verification link is invalid or has expired.",
  OAuthSignin: "Error constructing the authorization URL.",
  OAuthCallback: "Error during OAuth callback. Check client ID/secret and redirect URI.",
  OAuthAccountNotLinked: "Account not linked. Try a different sign-in method.",
  EmailCreateAccount: "Could not create account with the email provider.",
  Callback: "An unexpected error happened during sign-in.",
  default: "Something went wrong while signing you in.",
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") ?? "default";
  const message = messages[error] ?? messages.default;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow">
        <h1 className="text-2xl font-bold text-white text-center">Sign in error</h1>
        <p className="mt-3 text-slate-300 text-center">{message}</p>
        <p className="mt-2 text-xs text-slate-500 text-center">Code: {error}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/auth/signin" className="px-4 py-2 rounded-md bg-slate-800 text-slate-100 hover:bg-slate-700">Try again</Link>
          <Link href="/" className="px-4 py-2 rounded-md border border-slate-700 text-slate-200 hover:bg-slate-800">Go home</Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center px-6">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
