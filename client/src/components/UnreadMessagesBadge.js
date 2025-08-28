import React, { useState, useEffect } from 'react';
import { getConversations } from '../api/messageApi';

const UnreadMessagesBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const conversations = await getConversations();
        const totalUnread = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Failed to fetch unread messages:', error);
        setUnreadCount(0);
      }
    };

    // Fetch immediately
    fetchUnreadCount();

    // Set up polling for real-time updates
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};

export default UnreadMessagesBadge;