import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

// ICE SERVERS
const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "8b197f766f536b8362d602a9",
    credential: "p0ckorjCcrVZQRgM",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "8b197f766f536b8362d602a9",
    credential: "p0ckorjCcrVZQRgM",
  },
];

const VideoCall = () => {
  const { callId } = useParams();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const userId = Math.random().toString(36).substring(2, 9);

  // ---------------- SOCKET ----------------
  const initSocket = () => {
    const socketUrl = import.meta.env.VITE_BACKEND_URL;

    socketRef.current = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("connect", async () => {
      console.log("Connected:", socketRef.current.id);

      // JOIN ROOM
      socketRef.current.emit("join-room", {
        roomId: callId,
        userId,
      });

      // ALWAYS create peer
      await createPeer(false);
    });

    socketRef.current.on("user-connected", async () => {
      console.log("User joined");

      // ONLY one creates offer
      if (!peerRef.current) return;

      const offer = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(offer);

      socketRef.current.emit("offer", {
        roomId: callId,
        offer,
      });
    });

    socketRef.current.on("offer", async (offer) => {
      console.log("Offer received");

      if (!peerRef.current) {
        await createPeer(false);
      }

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socketRef.current.emit("answer", {
        roomId: callId,
        answer,
      });
    });

    socketRef.current.on("answer", async (answer) => {
      console.log("Answer received");

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socketRef.current.on("ice-candidate", async (candidate) => {
      try {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error(err);
      }
    });
  };

  // ---------------- MEDIA ----------------
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;
    localVideoRef.current.srcObject = stream;
  };

  // ---------------- PEER ----------------
  const createPeer = async (isInitiator) => {
    peerRef.current = new RTCPeerConnection({ iceServers });

    localStreamRef.current.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, localStreamRef.current);
    });

    peerRef.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId: callId,
          candidate: event.candidate,
        });
      }
    };
  };

  // ---------------- CONTROLS ----------------
  const endCall = () => {
    peerRef.current?.close();
    socketRef.current?.disconnect();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setIsCallActive(false);
  };

  const toggleMute = () => {
    localStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    localStreamRef.current.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsVideoOff(!isVideoOff);
  };

  // ---------------- START ----------------
  const startCall = async () => {
    await startMedia();
    initSocket();
    setIsCallActive(true);
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      peerRef.current?.close();
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>🎥 Video Call</h1>

      {!isCallActive && (
        <button onClick={startCall}>Start Call</button>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <video ref={localVideoRef} autoPlay muted playsInline width="300" />
        <video ref={remoteVideoRef} autoPlay playsInline width="300" />
      </div>

      {isCallActive && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={toggleMute}>
            {isMuted ? "Unmute" : "Mute"}
          </button>

          <button onClick={toggleVideo}>
            {isVideoOff ? "Camera On" : "Camera Off"}
          </button>

          <button
            onClick={endCall}
            style={{ background: "red", color: "white" }}
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;