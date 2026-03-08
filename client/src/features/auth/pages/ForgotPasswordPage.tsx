import { useState } from 'react';
import { Link } from 'react-router-dom';
import { jobseekerService } from '@features/jobseeker/service/jobseeker.service';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  const requestPin = async () => { await jobseekerService.requestPasswordReset(email); setStep(2); setMessage('Reset PIN sent to your email'); };
  const verifyPin = async () => { await jobseekerService.verifyResetPin(email, pin); setStep(3); };
  const reset = async () => { await jobseekerService.resetPassword(email, pin, newPassword); setMessage('Password reset successful.'); };

  return (
    <div className="mx-auto mt-10 w-full max-w-md rounded border border-zinc-200 p-5">
      <h1 className="mb-4 text-xl font-semibold">Reset password</h1>
      {step === 1 ? <><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' className='mb-2 w-full rounded border border-zinc-300 px-3 py-2' /><button onClick={() => { void requestPin(); }} className='w-full rounded bg-zinc-900 py-2 text-white'>Send PIN</button></> : null}
      {step === 2 ? <><input value={pin} onChange={(e) => setPin(e.target.value)} placeholder='6-digit PIN' className='mb-2 w-full rounded border border-zinc-300 px-3 py-2' /><button onClick={() => { void verifyPin(); }} className='w-full rounded bg-zinc-900 py-2 text-white'>Verify PIN</button></> : null}
      {step === 3 ? <><input type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='New password' className='mb-2 w-full rounded border border-zinc-300 px-3 py-2' /><button onClick={() => { void reset(); }} className='w-full rounded bg-zinc-900 py-2 text-white'>Reset password</button></> : null}
      <p className='mt-3 text-sm text-zinc-600'>{message}</p>
      <Link to='/login' className='mt-2 block text-sm underline'>Back to login</Link>
    </div>
  );
};
