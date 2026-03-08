import {
    Show,
    SignInButton,
    SignUpButton,
    UserButton
} from "@clerk/react";

import { Sparkles } from "lucide-react";

const Navbar = () => {
    return (
        <header className="w-full border-b glass px-6 py-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">

            <div className="flex items-center gap-3">
                <Sparkles className="text-indigo-500 size-5" />
                <h2 className="font-semibold text-foreground/80 tracking-tight">
                    AI Campaign Studio
                </h2>
            </div>

            <div className="flex items-center gap-4">

                <div className="px-2 py-1 rounded bg-secondary text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                    ContentOS v1.0
                </div>

                <Show when="signed-out">
                    <SignInButton />
                    <SignUpButton />
                </Show>

                <Show when="signed-in">
                    <UserButton />
                </Show>

            </div>

        </header>
    );
};

export default Navbar;