import ForgetForm from "../_components/ForgetForm";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Trailidea",
  description: "Request a password reset link for your Trailidea account.",
};

export default function ForgotPasswordPage() {
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
                <ForgetForm />
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