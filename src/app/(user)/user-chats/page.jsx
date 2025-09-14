'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pb } from '@/app/lib/pocketbase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faComments, faUser, faClock } from '@fortawesome/free-solid-svg-icons';

export default function UserChatsPage() {
  const me = pb.authStore.record;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!me?.id) throw new Error('Not authenticated');
        
        const conversations = await pb.collection('conversations').getFullList({
          filter: `user_id="${me.id}"`,
          sort: '-last_message_at',
          expand: 'therapist_id'
        });
        
        setChats(conversations);
      } catch (e) {
        console.error(e);
        setError(e?.message || 'Failed to load chats');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-800 font-medium">Loading your chats...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Home
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Home
          </Link>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faComments} className="text-2xl mr-3" />
              <div>
                <h1 className="text-2xl font-bold">My Chats</h1>
                <p className="text-blue-100 mt-1">Your conversations with therapists</p>
              </div>
            </div>
          </div>
        </div>
        
        {chats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FontAwesomeIcon icon={faComments} className="text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Start a conversation with a therapist to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map(chat => (
              <Link 
                key={chat.id} 
                href={`/chat/${chat.id}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-5 border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">
                        Dr. {chat.expand?.therapist_id?.name || 'Therapist'}
                      </h3>
                      <p className="text-gray-600 text-sm truncate max-w-md">
                        {chat.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {chat.last_message_at && (
                      <div className="flex items-center text-xs text-gray-400">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        {new Date(chat.last_message_at).toLocaleDateString()}
                      </div>
                    )}
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 ml-auto"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}