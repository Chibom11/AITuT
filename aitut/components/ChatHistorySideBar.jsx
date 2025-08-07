

import { SideBar } from '../components/SideBar';
// ✅ Import SignedIn and UserButton from Clerk
import { UserButton, SignedIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MenuIcon, Plus, Trash } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
function ChatHistorySidebar() {
  const router = useRouter();
  // All these hooks are now safe because this component is protected.
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);
  const chats = useQuery(api.chats.listChats);

  const handleNewChat = async () => {
    const newChatId = await createChat({ title: "New Chat" });
    router.push(`/dashboard/chat/${newChatId}`);
  };

  const handleDelete = async (chatId) => {
    await deleteChat({ id: chatId });
    router.push(`/dashboard`);
  };

  return (
    
            <SideBar>
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className='flex items-center justify-center m-auto w-[50%] space-x-1 px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>

            {/* Chat History Box */}
             <div className=' mt-4 mx-4 p-3 rounded-lg bg-gray-100 shadow-inner border border-gray-300 max-h-[600px] overflow-y-auto'>
              <h2 className='text-sm font-bold text-gray-700 mb-2'> Chats</h2>
              {!chats ? (
                  <p className='text-sm text-gray-500'>Loading chats...</p>
                ) : chats?.length === 0 ? (
                  <p className='text-sm text-gray-500'>No chats yet</p>
                ) : (
                  <ul className='space-y-1'>
                    {chats?.map((el) => (
                      <li
                        key={el._id}
                        className='flex justify-between text-sm text-gray-800 bg-white  px-3 py-1 rounded cursor-pointer truncate'
                        title={el.title}
                        onClick={() => router.push(`/dashboard/chat/${el._id}`)}
                      >
                        <span>{el.title || el._id.slice(0, 6)}...</span>
                        <Trash
                          className='w-5 h-5 border-2 hover:scale-[106%]'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(el._id); 
                          }}
                        />

                      </li>

                    ))}
                  </ul>
                )}

            </div> 
       </SideBar>
  );
}

export default ChatHistorySidebar