import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { io } from "socket.io-client";


export const useSocket = () => {
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    useEffect(() => {
        
        socketRef.current = io('http://localhost:4000');

        return () => {
            socketRef.current.disconnect();
        };
    },[])
    return { socketRef, loading,setLoading };
}

