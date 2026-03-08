import { SignInButton, SignUpButton } from "@clerk/react";
import {
    Sparkles,
    Calendar,
    TrendingUp,
    Users,
    Layers
} from "lucide-react";

const SignedOutLanding = () => {
    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center px-6">

            <div className="max-w-4xl w-full text-center space-y-10">

                {/* Logo */}
                <div className="flex justify-center">
                    <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <Sparkles size={28} />
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-4">

                    <h1 className="text-4xl font-bold tracking-tight">
                        ContentOS
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        ContentOS is an AI-powered content intelligence platform that
                        generates multi-platform campaigns, personalizes content for
                        different audiences, predicts engagement before publishing,
                        and automatically builds optimized content calendars —
                        all from a single campaign goal.
                    </p>

                    <p className="text-sm text-muted-foreground/80">
                        Built for hackathons to demonstrate AI-driven workflow automation
                        beyond simple text generation.
                    </p>

                </div>

                {/* Auth Buttons */}
                <div className="flex justify-center gap-4">

                    <SignInButton>
                        <button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition">
                            Sign In
                        </button>
                    </SignInButton>

                    <SignUpButton>
                        <button className="px-6 py-3 rounded-xl border border-border font-semibold hover:bg-secondary transition">
                            Create Account
                        </button>
                    </SignUpButton>

                </div>

                {/* Features */}
                <div className="grid md:grid-cols-4 gap-4 mt-10 text-sm">

                    <div className="glass p-4 rounded-xl flex flex-col items-center gap-2">
                        <Layers size={18} />
                        Multi-Platform Campaigns
                    </div>

                    <div className="glass p-4 rounded-xl flex flex-col items-center gap-2">
                        <Users size={18} />
                        Audience Personalization
                    </div>

                    <div className="glass p-4 rounded-xl flex flex-col items-center gap-2">
                        <TrendingUp size={18} />
                        Engagement Prediction
                    </div>

                    <div className="glass p-4 rounded-xl flex flex-col items-center gap-2">
                        <Calendar size={18} />
                        AI Content Calendar
                    </div>

                </div>

            </div>
        </div>
    );
};

export default SignedOutLanding;