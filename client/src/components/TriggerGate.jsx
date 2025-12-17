import React, { useEffect } from 'react'
import { useSocket } from '../hooks/useSocket';
import { useNavigate } from 'react-router';

const TriggerGate = () => {
    const navigate = useNavigate();
    
    const handleClick = async () => {
        navigate('/chatroom');
    };

  return (
      <div className='h-[100vh] w-[100vw] flex justify-center items-center '>
          <button onClick={handleClick}>
              start
          </button>
    </div>
  )
}

export default TriggerGate