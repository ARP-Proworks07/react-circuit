import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const ChatBox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
          {/* Chat Header */}
          <div className="p-4 border-b bg-blue-500 text-white rounded-t-lg">
            <h3 className="font-semibold">Chat Support</h3>
          </div>

          {/* Chat Messages Area */}
          <div className="h-96 overflow-y-auto p-4">
            {/* Add your chat messages here */}
            <div className="text-gray-500 text-center">
              Start a conversation...
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox; 