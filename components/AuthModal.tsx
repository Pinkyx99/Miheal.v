import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogoIcon } from './icons';
import { Provider } from '@supabase/supabase-js';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  view: 'signIn' | 'signUp';
  setView: (view: 'signIn' | 'signUp') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, view, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        if (view === 'signUp') {
            if (!username) {
                setError("Username is required.");
                setLoading(false);
                return;
            }
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username,
                        avatar_url: `https://picsum.photos/seed/${username}/40/40` // Default avatar
                    }
                }
            });
            if (signUpError) throw signUpError;
            // Optionally, show a "check your email" message
            onClose();

        } else { // 'signIn'
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (signInError) throw signInError;
            onClose();
        }
    } catch (err: any) {
        setError(err.error_description || err.message);
    } finally {
        setLoading(false);
    }
  };
  
  const handleOAuthSignIn = async (provider: Provider) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'https://gamdom2.vercel.app',
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, the browser will redirect, so no need to set loading to false.
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-backdrop" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-4xl min-h-[600px] rounded-2xl flex overflow-hidden shadow-2xl border border-outline modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorative Left Panel */}
        <div 
            className="hidden md:block w-1/3 bg-background p-8 relative overflow-hidden"
            style={{
                backgroundImage: 'url(https://i.imgur.com/BLxw7CY.png)',
                backgroundPosition: 'center',
                backgroundSize: '140%',
                backgroundRepeat: 'no-repeat',
            }}
        >
        </div>

        {/* Auth Form */}
        <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center space-x-2">
                <LogoIcon className="h-8 w-8 text-white" />
                <h2 className="text-2xl font-bold text-white">{view === 'signIn' ? 'Sign In' : 'Create Account'}</h2>
             </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-white" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

            {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-md mb-4">{error}</p>}

          <form onSubmit={handleAuth} className="space-y-4">
            {view === 'signUp' && (
                <div>
                    <label className="text-sm font-medium text-text-muted" htmlFor="email">Email</label>
                    <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-background border border-outline rounded-md p-3 mt-1 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none"/>
                </div>
            )}
            <div>
              <label className="text-sm font-medium text-text-muted" htmlFor="username">{view === 'signIn' ? 'Username or Email' : 'Username'}</label>
              <input id="username" type={view === 'signIn' ? 'text' : 'text'} value={view === 'signIn' ? email : username} onChange={e => view === 'signIn' ? setEmail(e.target.value) : setUsername(e.target.value)} required className="w-full bg-background border border-outline rounded-md p-3 mt-1 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none"/>
            </div>
            <div>
              <label className="text-sm font-medium text-text-muted" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-background border border-outline rounded-md p-3 mt-1 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none"/>
            </div>

            <div className="flex justify-between items-center text-sm">
                <label className="flex items-center space-x-2 text-text-muted cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded bg-background border-outline text-accent-green focus:ring-accent-green"/>
                    <span>Remember me</span>
                </label>
                <a href="#" className="text-accent-green hover:underline">Forgot your password?</a>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-accent-green text-white font-semibold py-3 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (view === 'signIn' ? 'Start Playing' : 'Create Account')}
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-outline"/>
            <span className="mx-4 text-xs font-semibold text-text-muted">OR</span>
            <hr className="flex-grow border-t border-outline"/>
          </div>

          <div className="flex justify-center">
            <button className="g-button" onClick={() => handleOAuthSignIn('google')}>
                <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="g-svg">
                    <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" className="g-blue"></path>
                    <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" className="g-green"></path>
                    <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" className="g-yellow"></path>
                    <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" className="g-red"></path>
                </svg>
                <span className="g-text">Continue with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-text-muted mt-6">
            {view === 'signIn' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setView(view === 'signIn' ? 'signUp' : 'signIn')} className="font-semibold text-accent-green hover:underline ml-1">
              {view === 'signIn' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};