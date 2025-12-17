  import React, { useEffect, useRef, useState } from 'react'
  import { useSocket } from '../hooks/useSocket';

  const ChatRoom = () => {
    const { loading, setLoading, socketRef } = useSocket();
    const [isSender, setIsSender] = useState(false);
    const peerConnection = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);


    
    const  makeCall= async() => {
      const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }; //also u can add another server like turn server here
      peerConnection.current = new RTCPeerConnection(configuration);

      peerConnection.current.ontrack = (event) => {
        console.log("remote track received", event.streams);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          remoteVideoRef.current.play();
        }
      };

      console.log('peerConnection', peerConnection.current);

      socketRef.current.on('send-offer', (message) => {
        const msg = JSON.parse(message);
        console.log('this is msg', msg);
        console.log('setting isSender ', isSender);
        console.log('msg roomId',msg.roomId);
        if (msg.roomId) setIsSender(true);
      })

      socketRef.current.on('answer', async(message) => {
        console.log('message **************** ', message);
        const msg = JSON.parse(JSON.parse(message).data);
        console.log('msg is ', msg);
        const answer = msg.answer;
        console.log('answer is ', answer);
        const remoteDesc = new RTCSessionDescription(answer);
        console.log('message received answer ', remoteDesc);
        await peerConnection.current.setRemoteDescription(remoteDesc);
      })

      socketRef.current.on('message', async (message_) => {
        console.log('received message ', message_);

        const message = JSON.parse(message_);
        console.log('message is ', message);


        if (message.data.type === 'offer') {
          console.log('inside offer');
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.muted = true;
            localVideoRef.current.play();
          }

          stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
          });
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.data.offer));

          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socketRef.current.emit('answer', JSON.stringify({ answer: answer,type:'answer' }));

        };


        if (message.type === 'answer') {
          const remoteDesc = new RTCSessionDescription(message.answer);
          console.log('message received answer ',remoteDesc);
          await peerConnection.current.setRemoteDescription(remoteDesc);
        };

        if (message.type === 'ice_candidate') {
          try {
            await peerConnection.current.addIceCandidate(message.iceCandidate);
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }

      });

    
      peerConnection.current.addEventListener('icecandidate', event => {
        // alert('hello');
          console.log('ice candiate event captured',event.candidate);
          if (event.candidate) {
            socketRef.current.emit('icecandidate', JSON.stringify({ new_ice_candidate: event.candidate, type: 'ice_candidate' }))
          }
      
        })
      
      socketRef.current.on('icecandidate', async (message_) => {
        alert('ice candidate received');
        console.log('ice candidate event received ', message_);
        const message = JSON.parse(JSON.parse(message_).data);
        console.log('ice candidate event received ', message);

        if (message.new_ice_candidate) {
          try {
            await peerConnection.current.addIceCandidate(message.new_ice_candidate);
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }
      });
    

      peerConnection.current.addEventListener('connectionstatechange', event => {
        if (peerConnection.current.connectionState === 'connected') {
          // Peers connected!
          alert('hooray');
          console.log('peers connected');
          console.log('p connected ', event);
        }
      });

      //must be run by sender side
      
    }

    useEffect(() => {
      if (!socketRef.current) return;

      const onConnect = () => {
        console.log('socket connected',socketRef.current.id);
        setLoading(false);
        makeCall();
      };

      socketRef.current.on('connect', onConnect);

      return () => {
        socketRef.current.off('connect', onConnect);
      };
    }, [socketRef]);


    useEffect(() => {
      console.log('is sender effect',isSender,peerConnection.current);
      console.log('Creating offer because isSender is true');
      if (!peerConnection.current) return;
      const startStream = async () => {
        const stream =  await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true; // avoid echo
          localVideoRef.current.play();
        }

        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });
        
        if (!isSender) return;
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        console.log('sender socekt id ', socketRef.current.id);
        console.log(
          'CLIENT EMIT offer from socket',
          socketRef.current.id,
          socketRef.current.connected
        );
        socketRef.current.emit(
          'offer',
          JSON.stringify({ offer, type: 'offer' })
        );
        
      }
      startStream();

      

      
      const createOffer = async () => {
        
      };

      createOffer();
      }, [socketRef,isSender]);

    if (loading) return <div className='text-center w-[100vw] h-[100vh]'>connecting...</div>;
    
    const handleClick = async () => {
      console.log('send button clicked');
      socketRef.current.emit('message', JSON.stringify({ type: "chat" }));

    };


    return (
      <div>
        <button onClick={handleClick}>send</button>
        {/* 🔹 VIDEO ADDITION: local video */}
        { localVideoRef && 
          <video
            ref={localVideoRef}
            height={312}
            width={312}
            className="bg-white"
            autoPlay
            playsInline
          />
        }

        <hr />
        <br />

        {/* 🔹 VIDEO ADDITION: remote video */} { remoteVideoRef && 
          <video
            ref={remoteVideoRef}
            height={312}
            width={312}
            className="bg-white"
            autoPlay
            playsInline
          />
        }


      </div>
    )
  }

  export default ChatRoom