import dynamic from "next/dynamic";
import { Suspense } from "react";

const TherapistChat = dynamic(() => import("@/components/therapist-chat"), {
    loading: () => <p>Loading chat...</p>,
});

export default function Home() {
    return (
        <main className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="z-10 w-full h-full bg-white shadow-lg flex flex-col">
                <div className="flex-1 overflow-hidden">
                    <Suspense fallback={<p>Loading chat...</p>}>
                        <TherapistChat />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
