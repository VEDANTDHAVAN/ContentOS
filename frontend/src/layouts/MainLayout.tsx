import type React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface Props {
    children: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
    return (
        <div className="flex h-screen mesh-gradient overflow-hidden">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 relative">

                <Navbar />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>

            </div>

        </div>
    );
};

export default MainLayout;