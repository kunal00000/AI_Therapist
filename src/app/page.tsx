import dynamic from "next/dynamic";
import { Suspense } from "react";

const TherapistChat = dynamic(() => import("@/components/therapist-chat"), {
    loading: () => <p>Loading chat...</p>,
});

export default function Home() {
    return (
        <main className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="z-10 w-full h-full bg-white shadow-lg flex flex-col">
                <h1 className="text-3xl font-semibold py-6 text-center text-gray-800 border-b border-gray-200 md:hidden">
                    AI Mental Health Assistant
                </h1>
                <div className="flex-1 overflow-hidden">
                    <Suspense fallback={<p>Loading chat...</p>}>
                        <TherapistChat />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
