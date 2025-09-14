'use client';

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from 'next/link';


const images = ["/service1.jpg", "/service2.jpg", "/service3.jpg"];

export default function ServicesPage() {
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic");
    const sub = searchParams.get("sub");

    const selected = sub || topic || "Service";

    // Slider state
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000); // change every 4s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Slider */}
            <div
                className="relative bg-cover bg-center h-[400px] transition-all duration-700"
                style={{ backgroundImage: `url(${images[current]})` }}
            >
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center p-6">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        {selected} Counselling
                    </h1>
                    <p className="mt-2 text-lg max-w-2xl">
                        {selected} can start early in life and feel overwhelming,
                        but with the right guidance and support, it is possible to heal
                        and live fully.
                    </p>
                    <div className="mt-6 flex space-x-4">
                        <Link href="/therapistinfopage">
                            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium shadow">
                                Find My Therapist
                            </button>
                        </Link>

                        <Link href="/therapistinfopage">
                            <button className="bg-teal-500 hover:bg-teal-600 px-6 py-2 rounded-lg font-medium shadow">
                                Book Session
                            </button>
                        </Link>
                    </div>

                </div>

                {/* Dots navigation */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-3 h-3 rounded-full ${current === idx ? "bg-white" : "bg-gray-400"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Description Section */}
            <section className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-xl -mt-12 relative z-10">
                <p className="text-gray-700 leading-relaxed">
                    “I feel like I am losing control”, “I can’t manage this anymore”,
                    “Why is this happening to me?” – This is what{" "}
                    <span className="font-semibold">{selected}</span> can often feel like.
                    It is one of the challenges many people face, leading to
                    stress, fear, and difficulty in everyday life.
                </p>

                <p className="mt-4 text-gray-700 leading-relaxed">
                    At <span className="font-bold text-blue-600">Blue Sage</span>,
                    we understand how deeply {selected} can affect someone’s wellbeing.
                    Our trained therapists provide personalized, evidence-based counselling
                    to help you identify triggers, manage symptoms, and build resilience.
                    Whether you’re struggling daily or occasionally, seeking help early
                    makes a huge difference.
                </p>

                <p className="mt-4 text-gray-700 leading-relaxed">
                    Through one-on-one sessions, you’ll learn strategies to reduce distress,
                    overcome avoidance behaviors, and restore confidence in yourself.
                    We’re here to guide you in turning fear into strength and uncertainty
                    into clarity.
                </p>
            </section>

            {/* Extra Section */}
            <section className="max-w-5xl mx-auto p-6 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    What Does It Feel Like?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                    Living with <span className="font-semibold">{selected}</span>
                    can feel like being trapped in a cycle of worry, physical discomfort,
                    and emotional stress. It may cause avoidance of situations, disrupt
                    relationships, and reduce overall quality of life. But you are not alone.
                    With the right guidance, it’s possible to regain control and live with peace of mind.
                </p>
            </section>
        </div>
    );
}
