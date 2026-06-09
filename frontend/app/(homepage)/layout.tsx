import Footer from "../_components/Footer";
import Navbar from "../_components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="mx-auto h-16 max-w-[1440px] ">
                {children}
            </div>
            <Footer/>
        </div>
    );
}