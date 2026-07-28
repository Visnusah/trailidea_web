"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { handleVerifyOTP, handleResendOTP } from "@/lib/actions/auth-action";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthContext";

function VerifyOTPForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const router = useRouter();
    const { login } = useAuth();

    const [otpCode, setOtpCode] = useState("");
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!email) {
            router.push("/register");
        }
    }, [email, router]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        if (otpCode.length !== 6) {
            toast.error("Please enter a 6-digit code.");
            return;
        }

        startTransition(async () => {
            const result = await handleVerifyOTP(email, otpCode);
            if (result.success) {
                toast.success("Email verified successfully! You are now logged in.");
                if (result.data?.token && result.data?.user) {
                    await login(result.data.token, result.data.user);
                }
                router.push("/dashboard");
            } else {
                toast.error(result.message);
            }
        });
    };

    const handleResend = async () => {
        if (!email) return;
        setTimeLeft(120);
        setOtpCode("");
        
        startTransition(async () => {
            const result = await handleResendOTP(email);
            if (result.success) {
                toast.success("A new OTP has been sent to your email.");
            } else {
                toast.error(result.message);
                setTimeLeft(0); // reset if failed
            }
        });
    };

    const fieldClass = "h-12 w-full border border-hairline bg-surface-card px-4 text-center text-xl tracking-[4px] font-bold text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark";
    const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body";

    if (!email) return null; // Wait for redirect if no email

    return (
        <div className="w-full max-w-md">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-muted">Verification</p>
            <h1 className="mb-4 text-4xl font-bold uppercase leading-none text-on-dark">Check your email</h1>
            <p className="mb-8 text-sm text-body">
                We've sent a 6-digit verification code to <span className="font-bold text-on-dark">{email}</span>.
                Enter it below to confirm your account.
            </p>

            <form onSubmit={handleVerify}>
                <div className="mb-6">
                    <label className={labelClass}>Verification Code</label>
                    <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} // only digits
                        placeholder="••••••"
                        className={fieldClass}
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={isPending || otpCode.length !== 6}
                    className="mb-6 flex h-12 w-full items-center justify-center bg-on-dark text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Verifying..." : "Verify Code"}
                </button>

                <div className="flex flex-col items-center gap-2 text-sm text-body">
                    {timeLeft > 0 ? (
                        <p>Code expires in <span className="font-bold text-on-dark">{formatTime(timeLeft)}</span></p>
                    ) : (
                        <p className="text-m-red">Code expired</p>
                    )}
                    
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={timeLeft > 0 || isPending}
                        className={`font-bold underline-offset-4 hover:underline ${timeLeft > 0 ? 'text-muted cursor-not-allowed' : 'text-on-dark'}`}
                    >
                        Resend Code
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <div className="auth-root">
          <div className="auth-blob-top" aria-hidden="true" />
          <div className="auth-blob-bottom" aria-hidden="true" />
    
          <main className="auth-login-main" id="main-content">
            <div className="auth-login-inner animate-fade-in-up">
              <div className="brand-center">
                <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h1 className="brand-center__name">Trailidea</h1>
                </Link>
                <p className="brand-center__tagline">
                  Welcome back to the wild.
                </p>
              </div>
    
              <div className="auth-card animate-fade-in-up animate-delay-100">
                <Suspense fallback={<div className="w-full max-w-md text-center py-20 text-muted">Loading...</div>}>
                    <VerifyOTPForm />
                </Suspense>
              </div>
            </div>
          </main>
    
          <footer className="auth-footer">
            <div className="auth-footer__inner">
              <p className="auth-footer__copy">
                © 2024 Trailidea. Explore responsibly.
              </p>
            </div>
          </footer>
        </div>
    );
}
