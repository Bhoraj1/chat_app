import { create } from "zustand";
import { axiosInstance } from "./../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  recentChats: [], 

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.users });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.messages || [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, recentChats } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser.id}`,
        messageData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update recent chats when sending message
      const updatedRecentChats = [
        selectedUser.id,
        ...recentChats.filter((id) => id !== selectedUser.id),
      ];

      set({
        messages: [...messages, res.data.message],
        recentChats: updatedRecentChats,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { authUser } = useAuthStore.getState();
      const { selectedUser, recentChats } = get();

      // Update recent chats list
      const otherUserId =
        newMessage.senderId === authUser.id
          ? newMessage.receiverId
          : newMessage.senderId;

      const updatedRecentChats = [
        otherUserId,
        ...recentChats.filter((id) => id !== otherUserId),
      ];
      set({ recentChats: updatedRecentChats });

      // Only show messages for current conversation
      if (selectedUser) {
        const isMessageForCurrentChat =
          (newMessage.senderId === selectedUser.id &&
            newMessage.receiverId === authUser.id) ||
          (newMessage.senderId === authUser.id &&
            newMessage.receiverId === selectedUser.id);

        if (isMessageForCurrentChat) {
          set({ messages: [...get().messages, newMessage] });
        }
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
  },

  getSortedUsers: () => {
    const { users, recentChats } = get();
    // Sort users: recent chats first, then alphabetically
    return users.sort((a, b) => {
      const aIndex = recentChats.indexOf(a.id);
      const bIndex = recentChats.indexOf(b.id);

      // If both have recent messages, sort by recency
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // If only one has recent messages, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // If neither has recent messages, sort alphabetically
      return a.fullName.localeCompare(b.fullName);
    });
  },
}));
