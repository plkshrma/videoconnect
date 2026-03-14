import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const generateRoomId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
  };

  const createRoom = () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    const finalRoomId = roomId || Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/call/${finalRoomId}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    navigate(`/call/${roomId.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <div className="text-6xl mb-4">📹</div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              VideoConnect
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start or join a video call
            </p>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-6">
          {/* Create Room Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Room</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                  Room Name
                </label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="generatedRoomId" className="block text-sm font-medium text-gray-700">
                  Room ID (Auto-generated)
                </label>
                <div className="flex space-x-2">
                  <input
                    id="generatedRoomId"
                    type="text"
                    value={roomId}
                    readOnly
                    placeholder="Click generate"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                  />
                  <button
                    onClick={generateRoomId}
                    className="mt-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <button
                onClick={createRoom}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Room
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Join Room Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Join Existing Room</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="joinRoomId" className="block text-sm font-medium text-gray-700">
                  Room ID
                </label>
                <input
                  id="joinRoomId"
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={joinRoom}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Share the room ID with others to let them join your call
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;