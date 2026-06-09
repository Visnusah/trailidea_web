// app/(auth)/_components/LoginForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleLoginUser } from "@/lib/actions/auth-action";
export default function LoginForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginFormData) => {
        // isPending is true during the transition,
        // and false after it finishes
        setError('');
        startTransition(
            async () => {
                try {
                    const result = await handleLoginUser(data);
                    if (result.success) {
                        router.push("/dashboard");
                    }else{
                        setError(result.message || 'Login failed');
                    }
                } catch (error: any) {
                    setError(error?.message || 'Login failed');
                }
            }
        );
    }
    return (
        <div className="w-full max-w-md">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-muted">Welcome back</p>
            <h1 className="mb-8 text-4xl font-bold uppercase leading-none text-on-dark">Sign in</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="mb-6 border border-m-red bg-m-red/10 px-4 py-3 text-sm text-m-red">{error}</div>}
                <div className="mb-5">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body">Email</label>
                    <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className="h-12 w-full border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark"
                    />
                    {errors.email && <span className="mt-1 block text-sm text-m-red">{errors.email.message}</span>}
                </div>

                <div className="mb-6">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body">Password</label>
                    <input
                        type="password"
                        {...register("password")}
                        placeholder="••••••••"
                        className="h-12 w-full border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark"
                    />
                    {errors.password && <span className="mt-1 block text-sm text-m-red">{errors.password.message}</span>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || isPending}
                    className="flex h-12 w-full items-center justify-center bg-on-dark text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Signing in..." : "Sign in"}
                </button>
                <p className="mt-6 text-center text-sm font-light text-body">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-bold text-on-dark underline-offset-4 hover:underline">Register here</Link>.
                </p>
            </form>
        </div>
    );
}
