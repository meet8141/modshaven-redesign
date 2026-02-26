// /user/logout page (GET)
import React from 'react';
import Grainient from '@/app/components/Grainient';

export default function LogoutPage() {
  return (
    <>
      
      <div style={{ maxWidth: 800, margin: '100px auto', padding: 24, position: 'relative', zIndex: 1, textAlign: 'center'}} className='flex flex-col justify-center items-center gap-4' >
        <h2 className='font-[800] text-[2rem]' >You have been logged out</h2>
        <a href="/user/login" style={{ color: '#ff6600', textDecoration: 'underline', fontWeight: 600 }}>Login again</a>
      </div>
    </>
  );
}
