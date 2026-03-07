// /user/login page (GET)
import React from 'react';

import { MoveRight } from 'lucide-react';
export default function LoginPage() {
  return (
    <>
     
      <div style={{ maxWidth: 800, margin: '100px auto', padding: 24, position: 'relative', zIndex: 1}} className='flex flex-col justify-center items-center gap-4' >
      <h2 className='font-[800] text-[2rem]' >Login</h2>
      <form method="POST" action="/user/login"  className= ' max-w-8xl flex gap-4 flex-col items-center justify-center p-8 rounded-[1rem] bg-black/30 backdrop-blur-lg border-2 border-[#ff6600]'>
        <div style={{ marginBottom: 16 }} className='flex flex-col justify-center items-center'>
          <label htmlFor="fullName">Username</label>
          <input type="text" id="fullName" name="fullName" required style={{ width: '100%', padding: 8, marginTop: 4 }} className='bg-[#282934] rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-[#ff6600]'/>
        </div>
        <div style={{ marginBottom: 16 }} className='flex flex-col justify-center items-center '>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required style={{ width: '100%', padding: 8, marginTop: 4 }} className='bg-[#282934] rounded-[0.5rem] focus:outline-none focus:ring-2 focus:ring-[#ff6600]' />
        </div>
        <button type="submit" style={{ width: '50%', padding: 10, background: '#ff6600', color: '#fff', border: 'none'  }} className='rounded-[1rem] flex items-center justify-center gap-2'>Login <MoveRight size={16} /></button>
      </form>
    </div>
     
    </>
  );
}
