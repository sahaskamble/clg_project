'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { pb } from '@/app/lib/pocketbase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBriefcase, faGraduationCap, faTags, faArrowLeft, faPhone, faLocation } from '@fortawesome/free-solid-svg-icons';
import Calendar from '@/app/components/calender';
import Link from 'next/link';

export default function ViewTherapistProfile() {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('therapist id', id)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        console.log("URL param id (profileId) =", id);

        // Fetch directly by profile id
        const res = await pb.collection('therapist_profile').getOne(id, {
          expand: 'therapistId',
        });
        console.log("Expand Therapist", res)
        setTherapist(res);
        console.log("Expanded therapistId data:", res.expand?.therapistId);  // 👈 Add this


      } catch (error) {
        console.error("Error fetching therapist profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center text-gray-600">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl shadow-lg p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Therapist Profile</h1>
            <p className="text-sm opacity-90">View professional information of the therapist</p>
          </div>
        </div>

        {/* Profile Details */}
        {therapist ? (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <p>therapist name = {therapist.username}</p>
            {/* Bio */}
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <FontAwesomeIcon icon={faUser} />
                <span>Professional Bio</span>
              </div>
              <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">{therapist.bio || "Not provided"}</p>
            </div>

            {/* Experience + Qualification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <FontAwesomeIcon icon={faBriefcase} />
                  <span>Years of Experience</span>
                </div>
                <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">
                  {therapist.experience ? `${therapist.experience} years` : "Not provided"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <span>Qualifications</span>
                </div>
                <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">{therapist.qualification || "Not provided"}</p>
              </div>
            </div>

            {/* Location + Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <FontAwesomeIcon icon={faLocation} />
                  <span>Location</span>
                </div>
                <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">
                  {therapist.location ? `${therapist.location} years` : "Not provided"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                  <FontAwesomeIcon icon={faPhone} />
                  <span>Contact No</span>
                </div>
                <p className="mt-2 bg-gray-50 p-3 rounded-lg text-gray-700">{therapist.contact || "Not provided"}</p>
              </div>
            </div>

            {/* Specializations */}
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <FontAwesomeIcon icon={faTags} />
                <span>Specializations</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {therapist.specializations && therapist.specializations.length > 0 ? (
                  therapist.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium"
                    >
                      {spec}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Not provided</p>
                )}
              </div>
            </div>
            <Calendar
              therapistId={therapist.therapistId}
              therapistName={therapist.username}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No therapist profile found.
          </div>
        )}
      </div>
    </div>
  );
}
