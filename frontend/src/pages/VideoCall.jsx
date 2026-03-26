import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

// ✅ ICE SERVERS (STUN + TURN)
const iceServers = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "8b197f766f536b8362d602a9",
    credential: "p0ckorjCcrVZQRgM",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "8b197f766f536b8362d602a9",
    credential: "p0ckorjCcrVZQRgM",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "8b197f766f536b8362d602a9",
    credential: "p0ckorjCcrVZQRgM",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "8b197f766f536b8362d602a9",
    credential: "p0ckorjCcrVZQRgM",
  },
];

const VideoCall = () => {
  const { callId } = useParams();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isCallActive, setIsCallActive] = useState(false);

  const userId = `user_${Math.random().toString(36).substring(2, 8)}`;

  // ---------------- SOCKET ----------------
  const initializeSocket = () => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL;

    socketRef.current = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected:", socketRef.current.id);

      socketRef.current.emit("join-room", {
        roomId: callId,
        userId,
      });
    });

    socketRef.current.on("user-connected", async () => {
      console.log("👤 Another user joined");

      if (!peerConnectionRef.current) {
        await createPeerConnection(true);
      }
    });

    socketRef.current.on("offer", handleOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handleIceCandidate);

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  };

  // ---------------- MEDIA ----------------
  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Media error:", err);
    }
  };

  // ---------------- PEER ----------------
  const createPeerConnection = async (isInitiator = false) => {
    peerConnectionRef.current = new RTCPeerConnection({ iceServers });

    if (!localStreamRef.current) return;

    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    peerConnectionRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId: callId,
          candidate: event.candidate,
        });
      }
    };

    if (isInitiator) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socketRef.current.emit("offer", {
        roomId: callId,
        offer,
      });
    }
  };

  // ---------------- SIGNALING ----------------
  const handleOffer = async (offer) => {
    console.log("📩 Offer received");

    if (!peerConnectionRef.current) {
      await createPeerConnection(false);
    }

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);

    socketRef.current.emit("answer", {
      roomId: callId,
      answer,
    });
  };

  const handleAnswer = async (answer) => {
    console.log("📩 Answer received");

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  const handleIceCandidate = async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } catch (err) {
      console.error("ICE error:", err);
    }
  };

  // ---------------- START CALL ----------------
  const startCall = async () => {
    await startMedia();
    initializeSocket();
    setIsCallActive(true);
  };

  // ---------------- CLEANUP ----------------
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (peerConnectionRef.current) peerConnectionRef.current.close();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🎥 Video Call</h1>

      {!isCallActive && (
        <button
          onClick={startCall}
          style={{
            padding: "12px 30px",
            background: "green",
            color: "white",
            fontSize: "18px",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Start Call
        </button>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "300px", borderRadius: "10px" }}
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "300px", borderRadius: "10px" }}
        />
      </div>
    </div>
  );
};

export default VideoCall;