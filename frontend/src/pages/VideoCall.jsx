import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const VideoCall = () => {
  const { callId } = useParams();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  const userId = `user_${Math.random().toString(36).substring(2, 9)}`;

  const initializeSocket = useCallback(() => {
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    socketRef.current = io(socketUrl);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current.emit('join-room', callId, userId);
      setParticipants([userId]);
    });

    socketRef.current.on('user-connected', (newUserId) => {
      console.log('User connected:', newUserId);
      setParticipants(prev => [...prev, newUserId]);
      // Create peer connection for the new user
      createPeerConnection(newUserId);
    });

    socketRef.current.on('user-disconnected', (disconnectedUserId) => {
      console.log('User disconnected:', disconnectedUserId);
      setParticipants(prev => prev.filter(id => id !== disconnectedUserId));
    });

    // WebRTC signaling
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);

    // Chat messages
    socketRef.current.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });
  }, [callId, userId, createPeerConnection, handleOffer, handleAnswer, handleIceCandidate]);

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isVideoOff,
        audio: !isMuted
      });

      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error starting call:', error);
      alert('Could not access camera/microphone. Please check permissions.');
      setIsCallActive(false);
    }
  }, [isVideoOff, isMuted]);

  const createPeerConnection = useCallback(async (remoteUserId) => {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream to peer connection
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, streamRef.current);
      });
    }

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          to: remoteUserId,
          from: userId
        });
      }
    };

    // Create and send offer if we're the initiator
    if (participants.length === 1) { // We're the first user
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socketRef.current.emit('offer', {
          offer,
          to: remoteUserId,
          from: userId
        });
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  }, [participants.length, userId]);

  const handleOffer = useCallback(async (data) => {
    if (data.to === userId) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socketRef.current.emit('answer', {
          answer,
          to: data.from,
          from: userId
        });
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  }, [userId]);

  const handleAnswer = useCallback(async (data) => {
    if (data.to === userId) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  }, [userId]);

  const handleIceCandidate = useCallback(async (data) => {
    if (data.to === userId && data.candidate) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }, [userId]);

  useEffect(() => {

    if (isCallActive) {
      initializeSocket();
      startCall();
      intervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      endCall();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isCallActive, initializeSocket, startCall]);

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setParticipants([]);
    setCallDuration(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: userId,
        timestamp: new Date().toLocaleTimeString()
      };
      socketRef.current.emit('send-message', message);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Video Call</h1>
          {isCallActive && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">{formatDuration(callDuration)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className={`flex-1 relative ${isChatOpen ? 'mr-80' : ''}`}>
          {!isCallActive ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-6xl">📹</span>
                </div>
                <h2 className="text-2xl font-semibold mb-4">Ready to start your call?</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Click the button below to begin your video call session. Make sure your camera and microphone are enabled.
                </p>
                <button
                  onClick={() => setIsCallActive(true)}
                  className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Start Call
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-800 relative">
              {/* Remote Video (Main) */}
              <div className="h-full">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ display: participants.length > 1 ? 'block' : 'none' }}
                />
                {participants.length === 1 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl">👤</span>
                      </div>
                      <p className="text-gray-400">Waiting for others to join...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xl">👤</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800 bg-opacity-90 px-6 py-3 rounded-full">
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{isMuted ? '🔇' : '🎤'}</span>
                </button>

                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{isVideoOff ? '📷' : '📹'}</span>
                </button>

                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isChatOpen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">💬</span>
                </button>

                <button
                  onClick={() => setIsCallActive(false)}
                  className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="text-xl">📞</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-400 text-center">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{message.sender}</span>
                      <span className="text-xs text-gray-400">{message.timestamp}</span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;