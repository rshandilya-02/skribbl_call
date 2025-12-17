import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import './App.jsx';
import ChatRoom from './components/ChatRoom.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
  },
  {
    path: "/chatroom",
    element: <ChatRoom></ChatRoom>
  }
]);

createRoot(document.getElementById('root')).render(
  
    <RouterProvider router={router} >
      <App />
      </RouterProvider>
,
)
