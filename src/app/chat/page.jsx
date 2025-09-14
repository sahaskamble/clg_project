'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pb } from '@/app/lib/pocketbase';
import { fetchConversationsForMe } from '@/app/lib/chat';

export default function ConversationsPage() {
  const me = pb.authStore.record;
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (!me?.id) throw new Error('Not authenticated');
        const items = await fetchConversationsForMe(me.id);
        setConvos(items);
      } catch (e) {
        console.error(e);
        setError(e?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Loading chats...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Chats</h1>
      {convos.length === 0 && <div className="text-gray-500">No conversations yet.</div>}
      <div className="space-y-2">
        {convos.map(c => (
          <Link key={c.id} href={`/chat/${c.id}`} className="block border rounded p-3 hover:bg-gray-50">
            <div className="font-medium">Conversation</div>
            <div className="text-sm text-gray-600 truncate">{c.last_message || 'No messages yet'}</div>
            {c.last_message_at && (
              <div className="text-xs text-gray-400">{new Date(c.last_message_at).toLocaleString()}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
