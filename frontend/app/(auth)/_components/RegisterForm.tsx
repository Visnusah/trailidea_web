// app/(auth)/_components/RegisterForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterFormData } from "@/app/(auth)/_components/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleRegisterUser } from "@/lib/actions/auth-action";

export default function RegisterForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData) => {
        // isPending is true during the transition,
        // and false after it finishes
        setError('');
        startTransition(
            async () => {
                try {
                    const result = await handleRegisterUser(data);
                    if (result.success) {
                        router.push("/login");
                    }else{
                        setError(result.message || 'Registration failed');
                    }
                } catch (error: any) {
                    setError(error?.message || 'Registration failed');
                }
            }
        );
    }

    const fieldClass = "h-12 w-full border border-hairline bg-surface-card px-4 text-on-dark placeholder:text-muted outline-none transition-colors focus:border-on-dark";
    const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[1.5px] text-body";
    const errClass = "mt-1 block text-sm text-m-red";

    return (
        <div className="w-full max-w-md">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-muted">Join My App</p>
            <h1 className="mb-8 text-4xl font-bold uppercase leading-none text-on-dark">Create account</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="mb-6 border border-m-red bg-m-red/10 px-4 py-3 text-sm text-m-red">{error}</div>}
                <div className="mb-5">
                    <label className={labelClass}>Email</label>
                    <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className={fieldClass}
                    />
                    {errors.email && <span className={errClass}>{errors.email.message}</span>}
                </div>
                <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>First Name</label>
                        <input
                            type="text"
                            {...register("firstName")}
                            placeholder="Jane"
                            className={fieldClass}
                        />
                        {errors.firstName && <span className={errClass}>{errors.firstName.message}</span>}
                    </div>
                    <div>
                        <label className={labelClass}>Last Name</label>
                        <input
                            type="text"
                            {...register("lastName")}
                            placeholder="Doe"
                            className={fieldClass}
                        />
                        {errors.lastName && <span className={errClass}>{errors.lastName.message}</span>}
                    </div>
                </div>
                <div className="mb-5">
                    <label className={labelClass}>Username</label>
                    <input
                        type="text"
                        {...register("username")}
                        placeholder="janedoe"
                        className={fieldClass}
                    />
                    {errors.username && <span className={errClass}>{errors.username.message}</span>}
                </div>
                <div className="mb-5">
                    <label className={labelClass}>Password</label>
                    <input
                        type="password"
                        {...register("password")}
                        placeholder="••••••••"
                        className={fieldClass}
                    />
                    {errors.password && <span className={errClass}>{errors.password.message}</span>}
                </div>
                <div className="mb-6">
                    <label className={labelClass}>Confirm Password</label>
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
                    className="flex h-12 w-full items-center justify-center bg-on-dark text-xs font-bold uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {isPending ? "Creating account..." : "Register"}
                </button>
                <p className="mt-6 text-center text-sm font-light text-body">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-on-dark underline-offset-4 hover:underline">Login here</Link>.
                </p>
            </form>
        </div>
    );
}
