import React from 'react';
import { Toaster } from 'react-hot-toast';
import Routing from './Config/Routing';
import CustomCursor from './Components/CustomCursor';

function App() {

    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#111827',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            },
            success: {
              style: {
                background: '#0f172a',
                border: '1px solid #22c55e',
              },
            },
            error: {
              style: {
                background: '#1f2937',
                border: '1px solid #ef4444',
              },
            },
          }}
        />
        <CustomCursor />
        <Routing />
      </>
    );
  }

  export default App;