// Chat.jsx
'use client'

import { useMutation, useQuery } from 'convex/react'
import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/convex/_generated/api'
import QuizComponent from '@/components/QuizComponent' 
import axios from 'axios'
import VidsComponent from '@/components/VidsComponent'


function Chat() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false); 
  const [isYtSearch,setYtSearch]=useState(false);


  const messagesEndRef = useRef(null)
  const savesendMessage = useMutation(api.messages.send)
  const saveResponse = useMutation(api.messages.response)

  const params = useParams();
  const messagesFromDB = useQuery(api.messages.list, { chatId: params.chatid,type:"normal" });

  const extractQuizArray = (raw) => {
    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]") + 1;
    if (start === -1 || end === 0) return [];
    const jsonString = raw.slice(start, end);
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse quiz JSON", err);
      return [];
    }
  };
  
  const handleSend = async () => {
    setYtSearch(false)
    const userMessageContent = input.trim();
    if (!userMessageContent) return;
    setInput("");

    await savesendMessage({ chatId: params.chatid, content: userMessageContent });
    
    
    const context = [...messagesFromDB, { role: "user", content: userMessageContent }]
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    try {
      setIsLoading(true);
      const res = await axios.post('http://127.0.0.1:8000/get-ai-response', { input: context });
      const response=res.data.response;
      const agent_res = response.replace(/\n/g, " ");
      console.log(agent_res)

      console.log(agent_res)
      if (agent_res) {
        await saveResponse({ chatId: params.chatid, content: agent_res });

        
        if (agent_res.startsWith('QUIZ_$#%^&$24534')) {
          setIsQuizActive(true);
        }
        else if(agent_res.startsWith('YTSEARCH_$#%^&$24534')){
          setYtSearch(true)
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching or saving AI response:", error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messagesFromDB]);

  return (
    <div className="flex flex-col h-[90vh] w-[80vw] ml-[16rem] bg-transparent text-white font-inter rounded-lg shadow-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar pb-24">
        {messagesFromDB?.map((msg) => {
          const isQuizActive = msg.role === 'assistant' && msg.content.startsWith('QUIZ_$#%^&$24534');
          const isYtSearch=msg.role==='assistant' && msg.content.startsWith('YTSEARCH_$#%^&$24534')
          return (
            <div key={msg._id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] p-4 rounded-xl shadow-md transition-all duration-300 ease-in-out ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
              >
                {isYtSearch && (
                  <VidsComponent
                  vidData={extractQuizArray(msg.content)}
                  />

                )}
                {isQuizActive && (
                  <QuizComponent 
                    quizData={extractQuizArray(msg.content)}
                    onQuizComplete={() => setIsQuizActive(false)} 
                  />
                )} 
                {!isYtSearch && !isQuizActive &&(
                  <>
                    <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs text-right opacity-80 mt-2 block">
                      {(new Date(msg._creationTime).toLocaleString()).slice(12)}
                    </span>
                  </>
                )}
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-4 rounded-xl shadow-md bg-gray-600 text-white rounded-bl-none animate-pulse">
              <p className="italic">Generating response...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-[18rem] w-[78vw] p-4 bg-transparent flex items-center space-x-4 shadow-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter' && !isLoading && !isQuizActive) handleSend() }}
          placeholder={isQuizActive ? "Complete the quiz to continue..." : "Message your AI tutor..."}
          className="flex-1 p-3.5 rounded-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent shadow-inner"
          disabled={isQuizActive || isLoading}
        />
        
        <button
          onClick={handleSend}
          disabled={isQuizActive || isLoading}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
        

          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizonal"><path d="m3 3 3 9-3 9 19-9Z" /><path d="M19 12H9" /></svg>
        </button>
       
      </div>
    </div>
  )
}

export default Chat