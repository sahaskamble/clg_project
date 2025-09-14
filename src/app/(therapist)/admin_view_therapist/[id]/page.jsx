'use client';
import { pb } from "@/app/lib/pocketbase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faUser, 
  faBriefcase, 
  faGraduationCap, 
  faTags, 
  faEnvelope,
  faCalendar,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faHourglassHalf,
  faPhone, 
  faLocationDot
} from '@fortawesome/free-solid-svg-icons';

export default function AdminViewTherapist() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await pb.collection('therapist_profile').getOne(id, {
          expand: 'therapistId',
        });
        setProfile(res);
      } catch (err) {
        console.error("Error fetching therapist profile:", err);
        setError('Therapist profile does not exist');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Are you sure you want to ${newStatus} this therapist?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await pb.collection('therapist_profile').update(id, { status: newStatus });
      // Refresh the profile data
      const updatedProfile = await pb.collection('therapist_profile').getOne(id, {
        expand: 'therapistId',
      });
      setProfile(updatedProfile);
      alert(`Therapist profile has been ${newStatus} successfully.`);
    } catch (err) {
      console.error("Error updating therapist status:", err);
      alert("Failed to update therapist status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Loading therapist profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const getStatusIcon = () => {
    switch (profile.status) {
      case 'accepted':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-1" />;
      case 'rejected':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 mr-1" />;
      case 'pending':
        return <FontAwesomeIcon icon={faHourglassHalf} className="text-yellow-500 mr-1" />;
      default:
        return <FontAwesomeIcon icon={faClock} className="text-gray-500 mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Dashboard
          </Link>
        </div>
        
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Therapist Profile Review</h1>
              <p className="mt-2 text-blue-100">
                Admin view of therapist application and profile details
              </p>
            </div>
            <div className="bg-white text-blue-800 px-4 py-2 rounded-md flex items-center">
              {getStatusIcon()}
              <span className="capitalize">{profile.status}</span>
            </div>
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                  Username
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700">
                    {profile.username || profile.expand?.therapistId?.username || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                  Professional Bio
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-line">{profile.bio || 'No bio provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div>
                  <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-blue-600" />
                    Years of Experience
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{profile.experience ? `${profile.experience} years` : 'Not specified'}</p>
                  </div>
                </div>

                {/* Qualification */}
                <div>
                  <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faGraduationCap} className="mr-2 text-blue-600" />
                    Qualifications
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{profile.qualification || 'No qualifications listed'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                {/* Location */}
                <div className="w-1/2">
                  <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-blue-600" />
                    Location
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{profile.location || "No location listed"}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="w-1/2">
                  <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-600" />
                    Contact No.
                  </label>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{profile.contact || "No contact listed"}</p>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div>
                <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faTags} className="mr-2 text-blue-600" />
                  Specializations
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  {profile.specializations && profile.specializations.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(profile.specializations) ? (
                        profile.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {profile.specializations}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No specializations listed</p>
                  )}
                </div>
              </div>

              {/* Account Information */}
              {profile.expand?.therapistId && (
                <div>
                  <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b pb-2">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-600" />
                        Name
                      </label>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-700">{profile.expand.therapistId.name || 'Not specified'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-600" />
                        Email
                      </label>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-gray-700">{profile.expand.therapistId.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-xl font-semibold text-blue-800 mb-4 border-b pb-2">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faCalendar} className="mr-2 text-blue-600" />
                      Profile Created
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-700">
                        {profile.created 
                          ? new Date(profile.created).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center text-md font-medium text-gray-700 mb-2">
                      <FontAwesomeIcon icon={faCalendar} className="mr-2 text-blue-600" />
                      Last Updated
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-700">
                        {profile.updated 
                          ? new Date(profile.updated).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="pt-6 border-t">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Admin Actions</h3>
                <div className="flex flex-wrap gap-4">
                  {profile.status !== 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate('accepted')}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      )}
                      Approve Therapist
                    </button>
                  )}
                  
                  {profile.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                      )}
                      Reject Therapist
                    </button>
                  )}
                  
                  {profile.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate('pending')}
                      disabled={actionLoading}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-lg flex items-center transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <FontAwesomeIcon icon={faHourglassHalf} className="mr-2" />
                      )}
                      Set as Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
