

import { useEffect, useRef } from 'react';

export default function ChatInterface({ conversationChat }: { conversationChat: any[] }) {
    // const messagesEndRef = useRef(null);

    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // };

    // useEffect(() => {
    //     scrollToBottom();
    // }, [conversationChat]);

    if (!conversationChat || !Array.isArray(conversationChat) || conversationChat.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">No conversation data available for this section</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-h-screen bg-gray-100 rounded-lg shadow-lg">
            {/* Chat header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-lg">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-lg">AI</span>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-white font-bold">Interview Conversation</h3>
                        <p className="text-indigo-100 text-xs">Completed Interview</p>
                    </div>
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {conversationChat.map((item, index) => (
                    <div key={index} className="space-y-4">
                        {/* Interviewer's message */}
                        {item.interviewer && (
                            <div className="flex justify-start">
                                <div className="max-w-3/4 rounded-2xl p-4 bg-white text-gray-800 shadow-sm border border-gray-200">
                                    {item.interviewer}
                                </div>
                            </div>
                        )}

                        {/* User's message */}
                        {item.you && item.you.trim() !== "" && (
                            <div className="flex justify-end">
                                <div className="max-w-3/4 rounded-2xl p-4 bg-indigo-400 text-white">
                                    {item.you}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {/* <div ref={messagesEndRef} /> */}
            </div>
        </div>
    );
}

// import { useEffect, useRef } from 'react';

// export default function ChatInterface({ conversationChat }: { conversationChat: any }) {
//     const messagesEndRef = useRef(null);

//     // const scrollToBottom = () => {
//     //     messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
//     // };

//     // useEffect(() => {
//     //     scrollToBottom();
//     // }, [conversationChat]);

//     if (!conversationChat || !Array.isArray(conversationChat)) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <p className="text-gray-500">No conversation data available</p>
//             </div>
//         );
//     }

//     // Filter only valid messages
//     const messages = conversationChat.filter(item =>
//         item && item.response && item.sender && item.type
//     );

//     return (
//         <div className="flex flex-col h-full max-h-screen bg-gray-100 rounded-lg shadow-lg">
//             {/* Chat header */}
//             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-lg">
//                 <div className="flex items-center">
//                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
//                         <span className="text-indigo-600 font-bold text-lg">AI</span>
//                     </div>
//                     <div className="ml-3">
//                         <h3 className="text-white font-bold">Interview Conversation</h3>
//                         <p className="text-indigo-100 text-xs">Completed Interview</p>
//                     </div>
//                 </div>
//             </div>

//             {/* Chat messages */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
//                 {messages.map((item, index) => {
//                     const isInterviewer = item.sender === "interviewer";

//                     return (
//                         <div key={item.id || index} className={`flex ${isInterviewer ? "justify-start" : "justify-end"}`}>
//                             <div className={`max-w-3/4 rounded-2xl p-4 ${isInterviewer
//                                 ? "bg-white text-gray-800 shadow-sm border border-gray-200"
//                                 : "bg-indigo-600 text-white"
//                                 }`}>
//                                 {item.response}
//                             </div>
//                         </div>
//                     );
//                 })}
//                 <div ref={messagesEndRef} />
//             </div>
//         </div>
//     );
// }