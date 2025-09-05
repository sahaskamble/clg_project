'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pb } from '../../../lib/pocketbase';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faUser, 
  faVenusMars, 
  faBirthdayCake, 
  faBriefcase, 
  faHeart, 
  faEnvelope,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

export default function ViewUserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await pb.collection('user_profile').getOne(id, {
          expand: 'userId',
        });
        setProfile(res);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError('User profile does not exist');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-800 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
            <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Home
          </Link>
        </div>
        
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">User Profile</h1>
              <p className="mt-2 text-purple-100">
                Viewing profile information for {profile.username || 'User'}
              </p>
            </div>
            <div className="bg-white text-purple-800 px-4 py-2 rounded-md flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Client Profile
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="md:col-span-2">
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-purple-600" />
                  Username
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{profile.username || 'Not specified'}</p>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faVenusMars} className="mr-2 text-purple-600" />
                  Gender
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{profile.gender || 'Not specified'}</p>
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-purple-600" />
                  Age
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{profile.age || 'Not specified'}</p>
                </div>
              </div>

              {/* Profession */}
              <div>
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-purple-600" />
                  Profession
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700">{profile.profession || 'Not specified'}</p>
                </div>
              </div>

              {/* Concerns */}
              <div className="md:col-span-2">
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faHeart} className="mr-2 text-purple-600" />
                  Concerns
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  {profile.concerns && profile.concerns.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.concerns.map((concern, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No concerns listed</p>
                  )}
                </div>
              </div>

              {/* Email from expanded user */}
              {profile.expand?.userId && (
                <div className="md:col-span-2">
                  <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-purple-600" />
                    Email Address
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{profile.expand.userId.email}</p>
                  </div>
                </div>
              )}

              {/* Account Creation Date */}
              <div className="md:col-span-2">
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-purple-600" />
                  Member Since
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700">
                    {new Date(profile.created).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}