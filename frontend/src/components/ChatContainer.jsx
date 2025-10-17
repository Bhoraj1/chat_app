import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import MessageSkeleton from "./shared/MessageSkeleton";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";
import defaultImg from "../assets/profile.png";
import { useRef } from "react";
const ChatContainer = () => {
  const baseUrl = import.meta.env.VITE_BASE_IMG_URL;
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageRef = useRef(null);
  useEffect(() => {
    getMessages(selectedUser.id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?.id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (!messages.length) return;
    messageRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  if (isMessagesLoading) return <MessageSkeleton />;

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 ">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${
              message.senderId === authUser.id ? "chat-end" : "chat-start"
            }`}
            ref={messageRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser.id
                      ? authUser.profilePic
                        ? `${baseUrl}/${authUser.profilePic}`
                        : defaultImg
                      : selectedUser.profilePic
                      ? `${baseUrl}/${selectedUser.profilePic}`
                      : defaultImg
                  }
                  alt="Profile pic"
                />
              </div>
            </div>

            <div className="chat-bubble flex-col">
              {message.image && (
                <img
                  src={`${baseUrl}/${message.image}`}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
              <div>
                <time className="text-xs opacity-50 ml-1">
                  {new Date(message.created_at).toLocaleString()}
                </time>
              </div>
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
