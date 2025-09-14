'use client';
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pb } from "../lib/pocketbase";

const servicesData = {
  "Stress Anxiety Depression": [
    "Generalized Anxiety Disorder",
    "Obsessive Compulsive Disorder",
    "Panic Disorder",
    "Exam Anxiety",
  ],
  Confidence: ["Self Esteem", "Public Speaking", "Overcoming Shyness"],
  Trauma: ["PTSD", "Childhood Trauma", "Abuse Recovery"],
  Parenting: ["Single Parenting", "Work-Life Balance", "Child Behavior Issues"],
};

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check login status
  useEffect(() => {
    setIsLoggedIn(pb.authStore.isValid);
    const removeListener = pb.authStore.onChange(() => {
      setIsLoggedIn(pb.authStore.isValid);
    });
    return () => removeListener();
  }, []);

  // Profile navigation
  const handleProfileClick = async () => {
    const user = pb.authStore.model;
    const userId = user?.id;
    if (!userId) {
      router.push('/Login');
      return;
    }
    if (user.role === 'therapist') {
      try {
        const therapistRecord = await pb
          .collection('therapist_profile')
          .getFirstListItem(`therapistId="${userId}"`);
        router.push(`/therapist_profile/${therapistRecord.id}`);
      } catch (error) {
        router.push(`/therapist_profile/${userId}`);
      }
    } else if (user.role === 'user') {
      router.push(`/user_profile/${userId}`);
    } else {
      router.push('/');
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      // Search therapists by username OR location
      const results = await pb.collection("therapist_profile").getList(1, 20, {
  filter: `(username ~ "${searchQuery}" || location ~ "${searchQuery}") && status = "accepted"`,
});


      // Send results to a search page
router.push(`/therapistinfopage?search=${encodeURIComponent(searchQuery)}`);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex justify-center items-center">
              <Image
                src="/logo.png"
                width={48}
                height={48}
                alt="Blue Sage Logo"
                className="object-contain"
              />
            </div>
            <div className="ml-3 flex flex-col">
              <span className="text-xl font-bold text-blue-900 tracking-wide">BLUE</span>
              <span className="text-xl font-bold text-blue-600 tracking-wide">SAGE</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-lg font-semibold text-gray-700">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/about_us" className="hover:text-blue-600 transition">About Us</Link>
            <Link href="/therapistinfopage" className="hover:text-blue-600 transition">Therapists</Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button className="hover:text-blue-600 transition">Services</button>
              <div className="absolute top-full left-0 mt-2 w-[500px] bg-white shadow-lg rounded-lg p-4 grid grid-cols-2 gap-6 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
                {Object.keys(servicesData).map((topic) => (
                  <div key={topic}>
                    <h4 className="font-semibold text-blue-700 mb-2">{topic}</h4>
                    <ul className="space-y-1">
                      {servicesData[topic].map((sub) => (
                        <li key={sub}>
                          <Link
                            href={`/services_page?topic=${encodeURIComponent(topic)}&sub=${encodeURIComponent(sub)}`}
                            className="block text-gray-600 hover:text-blue-600 transition"
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* 🔍 Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-lg px-2 py-1">
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none px-2 text-sm w-48"
              />
              <button type="submit" className="text-blue-600 hover:text-blue-800 px-2">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </form>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!isLoggedIn ? (
              <div className="flex space-x-3">
                <Link href="/therapist_login">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow flex items-center text-sm font-medium">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Therapist Login
                  </button>
                </Link>
                <Link href="/user_login">
                  <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg flex items-center text-sm font-medium">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    User Login
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleProfileClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow flex items-center text-sm font-medium"
                >
                  <FontAwesomeIcon icon={faCircleUser} className="mr-2" />
                  Your Profile
                </button>
                <button
                  onClick={() => {
                    pb.authStore.clear();
                    router.push('/');
                  }}
                  className="border border-red-600 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg flex items-center text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-700 hover:text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
