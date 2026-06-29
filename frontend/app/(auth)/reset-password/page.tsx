// app/(auth)/reset-password/page.tsx

import ResetPasswordForm from "../_components/PasswordResetForm";


export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // get the search params
    const query = await searchParams;
    const { token } = query;
    return (
        <div>
            <ResetPasswordForm token={token as string} />
        </div>
    );
}