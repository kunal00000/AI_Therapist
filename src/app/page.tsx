import dynamic from "next/dynamic";
import { Suspense } from "react";

const TherapistChat = dynamic(() => import("@/components/therapist-chat"), {
  loading: () => <p>Loading chat...</p>,
});

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center lg:p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="z-10 w-full h-full lg:max-w-4xl bg-white rounded-lg shadow-lg lg:p-8">
        <h1 className="text-3xl font-semibold mb-6 text-center pt-4 text-gray-800">
          AI Mental Health Assistant
        </h1>
        <Suspense fallback={<p>Loading chat...</p>}>
          <TherapistChat />
        </Suspense>
      </div>
    </main>
  );
}
