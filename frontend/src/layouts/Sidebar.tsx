import { LayoutDashboard, History, Image, Settings, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: History, label: "Campaign History", path: "/history" },
    { icon: Image, label: "Assets", path: "/assets" },
    { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
    return (
        <aside className="w-68 h-screen border-r flex flex-col glass relative z-20">

            {/* Logo */}
            <div className="px-8 py-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">
                            ContentOS
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                            AI Workspace
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">

                {menuItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium text-sm group ${isActive
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                    >
                        <item.icon size={18} className="group-active:scale-95 transition-transform" />
                        {item.label}
                    </NavLink>
                ))}

            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border/50">
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/50">
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Pro Plan</p>
                    <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 mt-1">Generate unlimited campaigns</p>
                    <button className="mt-3 w-full py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                        Upgrade
                    </button>
                </div>
            </div>

        </aside>
    );
};

export default Sidebar;