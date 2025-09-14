'use client';
import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserMd,
  faBriefcase,
  faClock,
  faQuoteLeft,
  faGraduationCap,
  faArrowRight, faLocationDot, faPhone
} from '@fortawesome/free-solid-svg-icons';
import { useSearchParams, useRouter } from 'next/navigation';
import { createOrGetConversation } from '@/app/lib/chat';

export default function TherapistInfoCard({limit}) {
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams =  useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        let filter = 'status="accepted"';
        if(searchQuery) {
          filter = `(username ~ "${searchQuery}" || location ~ "${searchQuery}") && ${filter}`;
        }

        const options = {
          filter,
          expand: 'therapistId',
          sort: '-created',
        };

        if (limit) {
          options['perPage'] = limit;  // Limit number of therapists
          options['sort'] = '-created'; // Sort by newest first
        }

        const data = await pb.collection('therapist_profile').getList(1, limit || 50, options);
        console.log("Therapist Data InfoCard",data);
        setTherapists(data.items || data);  // getList returns an object with `.items`, while getFullList returns an array
      } catch (error) {
        console.error("Error fetching therapists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [limit, searchQuery]);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">Our Expert Therapists</h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
        Connect with our certified mental health professionals dedicated to supporting your wellness journey.
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-blue-50 p-5 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <FontAwesomeIcon icon={faUserMd} className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {therapist.username}
                    </h2>
                    <p className="text-blue-600 text-sm">{therapist.qualification || 'Licensed Therapist'}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Qualification</p>
                    <p className="font-medium text-gray-800 text-sm">{therapist.qualification || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faBriefcase} className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium text-gray-800 text-sm">{therapist.experience || '0'} years</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faQuoteLeft} className="text-blue-400 text-sm mr-1" />
                    <p className="text-xs text-gray-500">Professional Approach</p>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{therapist.bio || 'No bio available'}</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faLocationDot} className="text-blue-400 text-sm mr-1" />
                    <p className="text-xs text-gray-500">Location</p>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{therapist.location || 'No location available'}</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FontAwesomeIcon icon={faPhone} className="text-blue-400 text-sm mr-1" />
                    <p className="text-xs text-gray-500">Conatct Info</p>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3">{therapist.contact || 'No contact available'}</p>
                </div>

                {therapist.specializations && therapist.specializations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Areas of Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specializations.slice(0, 3).map((spec, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {spec}
                        </span>
                      ))}
                      {therapist.specializations.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          +{therapist.specializations.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="bg-blue-50 px-5 py-4 border-t border-gray-200 flex justify-between items-center">
                <Link href={`/view_profile/${therapist.id}`}>
                  <button className="font-medium text-md flex items-center gap-1 transition-colors duration-200">
                    View Profile
                  </button>
                </Link>
                <ChatAction therapistProfile={therapist} />
              </div>



            </div>
          ))}
        </div>
      )}

      {!isLoading && therapists.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faUserMd} className="text-blue-600 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Therapists Available</h3>
          <p className="text-gray-500">
            We don't have any therapists available at the moment. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
}

function ChatAction({ therapistProfile }) {
  const router = useRouter();
  const me = pb.authStore.record;
  const therapistId = therapistProfile?.therapistId || therapistProfile?.expand?.therapistId?.id;

  async function onChat() {
    try {
      if (!me?.id) return alert('Please login to chat');
      if (!therapistId) return alert('Invalid therapist');
      const convo = await createOrGetConversation({ userId: me.id, therapistId });
      router.push(`/chat/${convo.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to open chat');
    }
  }

  return (
    <button onClick={onChat} className="font-medium text-sm px-3 py-2 bg-blue-600 text-white rounded">
      Chat
    </button>
  );
}