import React from 'react';
import BuildingImage from '../../../shared/assets/BuildingImage.jpg'
const RegisterPage = () => {
    return (
        <div className='flex justify-center items-center bg-gray-100 w-full h-screen'>
            <div className='grid grid-cols-2 '>
                <div className='bg-zinc-600 w-130 h-135 rounded-l-xl p-3'>
                   <img  className='w-full h-full rounded-xl ' src={BuildingImage} alt="Building.jpg" />
                </div>
                <div className='bg-zinc-800 w-130 h-135 rounded-r-xl px-14 py-12'>
                    <h1 className='text-3xl text-white font-inter tracking-wider font-medium'>Create an account</h1>

                    <form className='w-full h-auto  ' action="">
                        <div className='flex flex-row gap-2 mt-9'>
                            <input className='rounded-md w-full bg-zinc-600  text-white' placeholder='Full name' type="text" />
                            <input className='rounded-md w-full bg-zinc-600  text-white' placeholder='Last name' type="text" />
                        </div>

                        <div className='w-full h-auto mt-6'>
                            <input type="email" className='rounded-md bg-zinc-600 w-full  text-white' placeholder='Email' />
                        </div>

                        <div className='w-full h-auto mt-6'>
                            <input type="password" className='rounded-md bg-zinc-600 w-full  text-white' placeholder='Password' />
                        </div>
                        
                        <div className='w-full h-auto  mt-15'>
                            <button className='w-full bg-zinc-600 h-auto p-3 rounded-md text-white'>
                              Create an account
                            </button>
                        </div>

                        <div className='flex w-full mt-3 text-white h-auto justify-center items-center'>
                            <p>Or sign in with</p>
                        </div>

                        <div className='flex flex-row justify-center items-center gap-8 mt-2'>
                            <button className='bg-transparent text-white border-1 border-white px-7 w-full py-2 rounded-md '>Google</button>
                            <button className='bg-transparent text-white border-1 border-white px-7 w-full py-2 rounded-md '>Apple</button>
                        </div>
                   

                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
