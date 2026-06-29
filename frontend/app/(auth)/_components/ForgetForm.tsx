// app/(auth)/_components/ForgetForm.tsx
"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleRequestPasswordReset } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation"; // Import useRouter
import toast from "react-hot-toast";

export const RequestPasswordResetSchema = z.object({
    email: z.string().email()
});

export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;
export default function ForgetForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RequestPasswordResetDTO>({
        resolver: zodResolver(RequestPasswordResetSchema)
    });
    const router = useRouter();
    const onSubmit = async (data: RequestPasswordResetDTO) => {
        try{
            const response = await handleRequestPasswordReset(data.email);
            if (response.success) {
                router.push('/login');
                toast.success('Password reset link sent to your email.');
            }else{
                toast.error(response.message || 'Failed to request password reset.');
            }
        }catch(error){
            toast.error((error as Error).message || 'Failed to request password reset.');
        }
    }
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Request Password Reset</h1>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-md"
            >
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        {...register("email")}
                        className="w-full border border-gray-300 p-2 rounded"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
        </div>
    );
}