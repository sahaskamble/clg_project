"use client";
import { useState } from "react";

export default function AboutUs() {
  const [reviews] = useState([
    {
      id: 1,
      name: "Anonymous User",
      text: "BetterCare has completely changed how I approach therapy. The process is smooth, supportive, and effective.",
    },
    {
      id: 2,
      name: "Anonymous User",
      text: "I finally feel heard and understood. The therapist matched to me was caring and professional.",
    },
    {
      id: 3,
      name: "Anonymous User",
      text: "Convenient, affordable, and life-changing. I would recommend BetterCare to anyone seeking help.",
    },
  ]);

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-800 to-blue-900 text-white text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
        <p className="max-w-3xl mx-auto text-lg text-blue-100 leading-relaxed">
          At BetterCare, we believe therapy should be accessible, affordable,
          and tailored to your needs. Our mission is to remove barriers to
          mental health care and empower people to take control of their
          wellbeing.
        </p>
      </section>

      {/* Navigation Section */}
      <section className="bg-blue-900 text-white py-6">
        <nav className="flex justify-center space-x-10 font-medium">
          <a href="#" className="hover:text-blue-300">About</a>
          <a href="#" className="hover:text-blue-300">Careers</a>
          <a href="#" className="hover:text-blue-300">Social Impact</a>
          <a href="#" className="hover:text-blue-300">Client Outcomes</a>
        </nav>
      </section>

      {/* Mission Section */}
      <section className="bg-blue-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">
          Find <span className="text-blue-600">yourself</span> in therapy
        </h2>
        <p className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed">
          Since 2013, BetterCare has helped millions of people around the world
          access high-quality mental health care. With a network of thousands of
          therapists, we are committed to breaking down the stigma and
          challenges associated with therapy. Together, we can build a future
          where mental health support is available to everyone, everywhere.
        </p>
      </section>

      {/* Reviews Section */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 py-20 px-6">
        <h2 className="text-center text-2xl font-bold text-white mb-12">
          What people are saying
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-lg p-6 text-center flex flex-col"
            >
              <p className="text-gray-700 italic mb-4">“{review.text}”</p>
              <h4 className="text-blue-700 font-semibold mt-auto">
                — {review.name}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-blue-50 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">
          Our Impact
        </h2>
        <p className="max-w-4xl mx-auto text-lg text-gray-700 leading-relaxed mb-12">
          BetterCare’s reach continues to grow. With over 32,000 therapists and
          millions of sessions delivered, we are creating measurable
          improvements in mental health outcomes across the globe.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">32,000+</h3>
            <p className="text-gray-600">Licensed Therapists</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">5 Million+</h3>
            <p className="text-gray-600">Sessions Completed</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">190+</h3>
            <p className="text-gray-600">Countries Reached</p>
          </div>
        </div>
      </section>
    </div>
  );
}
