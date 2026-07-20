import ResetPasswordForm from "../../_components/PasswordResetForm";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Trailidea",
  description: "Set a new password for your Trailidea account.",
};

export default async function Page({
    params
}: {
    params: Promise<{ token: string }>;
}) {
    const resolvedParams = await params;
    const { token } = resolvedParams;

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
                <ResetPasswordForm token={token} />
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
