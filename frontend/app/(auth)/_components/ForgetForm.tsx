// app/(auth)/_components/ForgetForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import Link from "next/link";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgetForm() {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        setError("");
        setSuccessMessage("");
        startTransition(async () => {
            const result = await handleRequestPasswordReset(data.email);
            if (result.success) {
                setSuccessMessage("If an account exists, a password reset link has been sent to your email.");
            } else {
                setError(result.message || "Failed to request password reset.");
            }
        });
    };

    const fieldClass = "h-12 w-full border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark";
    const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body";
    const errClass = "mt-1 block text-sm text-m-red";

    return (
        <div className="w-full max-w-md">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-muted">Account Recovery</p>
            <h1 className="mb-4 text-4xl font-bold uppercase leading-none text-on-dark">Forgot Password?</h1>
            <p className="mb-8 text-sm text-body">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            {successMessage ? (
                <div className="rounded border border-[#35775f] bg-[#e1efe7] px-4 py-6 text-center text-[#2d604e]">
                    <p className="font-bold">{successMessage}</p>
                    <Link href="/login" className="mt-4 block font-bold underline hover:no-underline">
                        Return to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    {error && <div className="mb-6 border border-m-red bg-m-red/10 px-4 py-3 text-sm text-m-red">{error}</div>}
                    <div className="mb-6">
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            {...register("email")}
                            placeholder="you@example.com"
                            className={fieldClass}
                        />
                        {errors.email && <span className={errClass}>{errors.email.message}</span>}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting || isPending}
                        className="mb-6 flex h-12 w-full items-center justify-center bg-on-dark text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isPending ? "Sending link..." : "Send Reset Link"}
                    </button>

                    <p className="text-center text-sm font-light text-body">
                        Remembered your password?{" "}
                        <Link href="/login" className="font-bold text-on-dark underline-offset-4 hover:underline">
                            Login here
                        </Link>
                    </p>
                </form>
            )}
        </div>
    );
}