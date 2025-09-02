'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pb } from '@/app/lib/pocketbase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBriefcase, faGraduationCap, faTags } from '@fortawesome/free-solid-svg-icons';

export default function ViewUserProfile() {
    const params = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get id from params safely
    const id = params?.id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if id is available
                if (!id) {
                    console.log("Waiting for id parameter...");
                    return;
                }

                console.log("URL param id (profileId) =", id);

                // Fetch directly by profile id
                const res = await pb.collection('user_profile').getOne(id, { 
                    expand: 'userId',
                    requestKey: null // Prevent request deduplication
                });
                
                setUser(res);
                console.log("Expanded user data:", res.expand?.userId);

            } catch (error) {
                console.error("Error fetching user profile:", error);
                setError(error.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we have an id
        if (id) {
            fetchData();
        }
    }, [id]); // Dependency on id

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-purple-800 font-medium">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-10 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-xl shadow-lg p-6 mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">User Profile</h1>
                        <p className="text-sm opacity-90">View professional information of the user</p>
                    </div>
                </div>

                {/* Profile Details */}
                {user ? (
                    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
                        <p>User name = {user.username}</p>
                        
                        {/* Bio */}
                        <div>
                            <div className="flex items-center gap-2 text-purple-700 font-medium">
                                <FontAwesomeIcon icon={faUser} />
                                <span>Profession</span>
                            </div>
                            <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">{user.profession || "Not provided"}</p>
                        </div>

                        {/* Experience + Qualification */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-purple-700 font-medium">
                                    <FontAwesomeIcon icon={faBriefcase} />
                                    <span>Age</span>
                                </div>
                                <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">
                                    {user.age ? `${user.age} years` : "Not provided"}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-purple-700 font-medium">
                                    <FontAwesomeIcon icon={faGraduationCap} />
                                    <span>Gender</span>
                                </div>
                                <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">{user.gender || "Not provided"}</p>
                            </div>
                        </div>

                        {/* Specializations */}
                        <div>
                            <div className="flex items-center gap-2 text-purple-700 font-medium">
                                <FontAwesomeIcon icon={faTags} />
                                <span>Concerns</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {user.concerns && user.concerns.length > 0 ? (
                                    user.concerns.map((conc, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 font-medium"
                                        >
                                            {conc}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">Not provided</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                        No user profile found.
                    </div>
                )}
            </div>
        </div>
    );
}