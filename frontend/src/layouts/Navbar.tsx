const Navbar = () => {
    return (
        <header className="w-full border-b glass px-6 py-4 flex items-center justify-between sticky top-0 z-10">

            <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="font-semibold text-foreground/80 tracking-tight">
                    AI Campaign Studio
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="px-2 py-1 rounded bg-secondary text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                    ContentOS v1.0
                </div>
            </div>

        </header>
    );
};

export default Navbar;