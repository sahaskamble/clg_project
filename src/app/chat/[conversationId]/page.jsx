'use client';

import { useEffect, useRef, useState } from 'react';
import { pb } from '@/app/lib/pocketbase';
import { fetchMessages, sendMessage, subscribeToConversationMessages, markMessagesRead } from '@/app/lib/chat';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPaperPlane, faPaperclip, faUser } from '@fortawesome/free-solid-svg-icons';

export default function ChatWindow() {
  const param = useParams();
  const router = useRouter();
  const { conversationId } = param;
  const me = pb.authStore.record;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let unsub;
    (async () => {
      try {
        if (!me?.id) throw new Error('Not authenticated');
        
        // Fetch conversation details
        const conv = await pb.collection('conversations').getOne(conversationId, {
          expand: 'user_id,therapist_id'
        });
        setConversation(conv);
        
        const initial = await fetchMessages(conversationId);
        setMessages(initial);

        try { await markMessagesRead(conversationId, me.id); } catch {}

        unsub = await subscribeToConversationMessages(conversationId, (e) => {
          if (e.action === 'create') setMessages(m => [...m, e.record]);
          if (e.action === 'update') setMessages(m => m.map(x => x.id === e.record.id ? e.record : x));
          if (e.action === 'delete') setMessages(m => m.filter(x => x.id !== e.record.id));
        });
      } catch (e) {
        console.error(e);
        setError(e?.message || 'Failed to load chat');
      }
    })();

    return () => { unsub && unsub(); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function onSend(e) {
    e.preventDefault();
    try {
      if (!text.trim() && !file) return;
      await sendMessage({ conversationId, senderId: me.id, content: text, file });
      setText('');
      setFile(null);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Failed to send');
    }
  }

  function fileUrl(m) {
    return m.attachments ? pb.files.getUrl(m, m.attachments) : null;
  }

  const getChatPartner = () => {
    if (!conversation) return 'Chat';
    if (conversation.user_id === me.id) {
      return `Dr. ${conversation.expand?.therapist_id?.name || 'Therapist'}`;
    } else {
      return conversation.expand?.user_id?.name || 'Patient';
    }
  };

  const getBackUrl = () => {
    if (!conversation) return '/';
    return conversation.user_id === me.id ? '/user-chats' : '/therapist-chats';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href={getBackUrl()} className="text-blue-600 hover:text-blue-800 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
          </Link>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{getChatPartner()}</h1>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.sender_id === me.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                m.sender_id === me.id 
                  ? 'bg-blue-600 text-white rounded-br-md' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}>
                {m.content && <div className="whitespace-pre-wrap">{m.content}</div>}
                {fileUrl(m) && (
                  <div className="mt-2">
                    <a 
                      className={`inline-flex items-center space-x-1 underline ${
                        m.sender_id === me.id ? 'text-blue-100' : 'text-blue-600'
                      }`} 
                      href={fileUrl(m)} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <FontAwesomeIcon icon={faPaperclip} className="text-sm" />
                      <span>Attachment</span>
                    </a>
                  </div>
                )}
                <div className={`text-xs mt-1 ${
                  m.sender_id === me.id ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {new Date(m.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={onSend} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
            />
            <label className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600">
              <FontAwesomeIcon icon={faPaperclip} />
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
              />
            </label>
          </div>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors disabled:opacity-50" 
            type="submit"
            disabled={!text.trim() && !file}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </form>
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            File selected: {file.name}
            <button 
              onClick={() => setFile(null)} 
              className="ml-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
