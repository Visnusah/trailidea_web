"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

const ResetPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState("");
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(ResetPasswordSchema)
    });

    const onSubmit = (data: ResetPasswordFormData) => {
        setError("");
        startTransition(async () => {
            const response = await handleResetPassword(token, data.password);
            if (response.success) {
                toast.success("Password reset successfully. You can now log in.");
                router.replace('/login');
            } else {
                setError(response.message || "Failed to reset password.");
                toast.error(response.message || "Failed to reset password.");
            }
        });
    };

    const fieldClass = "h-12 w-full border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark";
    const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body";
    const errClass = "mt-1 block text-sm text-m-red";

    return (
        <div className="w-full max-w-md">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-muted">Account Recovery</p>
            <h1 className="mb-4 text-4xl font-bold uppercase leading-none text-on-dark">New Password</h1>
            <p className="mb-8 text-sm text-body">
                Enter your new password below.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="mb-6 border border-m-red bg-m-red/10 px-4 py-3 text-sm text-m-red">{error}</div>}
                
                <div className="mb-5">
                    <label className={labelClass}>New Password</label>
                    <input
                        type="password"
                        {...register("password")}
                        placeholder="••••••••"
                        className={fieldClass}
                    />
                    {errors.password && <span className={errClass}>{errors.password.message}</span>}
                </div>
                
                <div className="mb-6">
                    <label className={labelClass}>Confirm New Password</label>
                    <input
                        type="password"
                        {...register("confirmPassword")}
                        placeholder="••••••••"
                        className={fieldClass}
                    />
                    {errors.confirmPassword && <span className={errClass}>{errors.confirmPassword.message}</span>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isPending}
                    className="mb-6 flex h-12 w-full items-center justify-center bg-on-dark text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Resetting..." : "Reset Password"}
                </button>

                <div className="flex flex-col items-center justify-center gap-2 text-sm text-body">
                    <Link href="/login" className="font-bold text-on-dark underline-offset-4 hover:underline">
                        Back to Login
                    </Link>
                    <Link href="/forget-password" className="text-xs font-bold text-muted underline-offset-4 hover:underline">
                        Request another reset link
                    </Link>
                </div>
            </form>
        </div>
    );
}