'use client';

import { pb } from '@/app/lib/pocketbase';

// Find existing conversation for user-therapist pair or create a new one
export async function createOrGetConversation({ userId, therapistId }) {
  if (!userId || !therapistId) throw new Error('userId and therapistId are required');

  const filter = `user_id="${userId}" && therapist_id="${therapistId}"`;
  const existing = await pb.collection('conversations').getList(1, 1, { filter, sort: '-updated' });
  if (existing?.items?.length) return existing.items[0];

  // Create new conversation
  return pb.collection('conversations').create({
    user_id: userId,
    therapist_id: therapistId,
    last_message: '',
    last_message_at: null,
  });
}

export async function fetchConversationsForMe(myId) {
  if (!myId) throw new Error('myId is required');
  return pb.collection('conversations').getFullList({
    filter: `user_id="${myId}" || therapist_id="${myId}"`,
    sort: '-last_message_at',
  });
}

export async function fetchMessages(conversationId, limit = 200) {
  if (!conversationId) throw new Error('conversationId is required');
  return pb.collection('messages').getFullList({
    filter: `conversation_id="${conversationId}"`,
    sort: 'created',
    perPage: limit,
  });
}

export async function sendMessage({ conversationId, senderId, content, file }) {
  if (!conversationId || !senderId) throw new Error('conversationId and senderId are required');
  if (!content && !file) throw new Error('Provide content or file');

  const formData = new FormData();
  formData.append('conversation_id', conversationId);
  formData.append('sender_id', senderId);
  if (content) formData.append('content', content);
  if (file) formData.append('attachments', file);

  const msg = await pb.collection('messages').create(formData);

  // Update conversation cache fields
  try {
    await pb.collection('conversations').update(conversationId, {
      last_message: content || (file ? '📎 Attachment' : ''),
      last_message_at: new Date().toISOString(),
    });
  } catch (e) {
    // Non-blocking
    console.warn('Failed to update conversation cache fields', e);
  }

  return msg;
}

// Requires messages.updateRule allowing recipients to toggle is_read only
export async function markMessagesRead(conversationId, myId) {
  if (!conversationId || !myId) throw new Error('conversationId and myId are required');
  const unread = await pb.collection('messages').getFullList({
    filter: `conversation_id="${conversationId}" && sender_id!="${myId}" && is_read=false`,
    perPage: 200,
  });
  await Promise.all(unread.map(m => pb.collection('messages').update(m.id, { is_read: true })));
}

export async function subscribeToConversationMessages(conversationId, onEvent) {
  if (!conversationId) throw new Error('conversationId is required');
  const filter = `conversation_id="${conversationId}"`;
  const unsub = await pb.collection('messages').subscribe('*', (e) => {
    onEvent?.(e);
  }, { filter });
  return unsub;
}
