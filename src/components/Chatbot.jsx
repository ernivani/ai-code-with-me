import React from 'react';

function Chatbot() {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">Chatbot</h2>
      <div className="flex-1 p-2 bg-gray-50 rounded-lg overflow-y-auto border border-gray-300">
        {/* Placeholder pour les messages du chatbot */}
        <p className="text-gray-500">[Message de bienvenue du chatbot]</p>
        <p className="text-gray-500 mt-2">[Autres messages...]</p>
      </div>
      <input
        type="text"
        className="mt-4 p-2 border border-gray-300 rounded-lg"
        placeholder="Écrivez un message..."
        disabled
      />
    </div>
  );
}

export default Chatbot;
