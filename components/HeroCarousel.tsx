import React from 'react';

interface HeroProps {
    session: any; // Using `any` to avoid needing to import Supabase types
    onSignUpClick: () => void;
    onGoogleSignInClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ session, onSignUpClick, onGoogleSignInClick }) => {
    return (
        <div className="relative rounded-2xl p-6 lg:p-8 flex flex-col justify-end items-start text-left min-h-[450px] bg-cover" style={{backgroundImage: 'url(https://i.imgur.com/VZPuEhD.png)', backgroundPosition: 'center 20%'}}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10">
                {/* Bottom-left section: Game Info & CTA */}
                <div>
                    <h1 className="text-5xl lg:text-6xl font-black text-white" style={{textShadow: '0 4px 15px rgba(0,0,0,0.5)'}}>
                        Gates of Olympus
                    </h1>
                    <div className="mt-6 flex flex-wrap items-center justify-start gap-4">
                        {session ? (
                             <button 
                                className="bg-primary hover:bg-primary-light text-background font-semibold px-8 py-3 rounded-lg text-base transition-transform duration-200 hover:scale-105 active:scale-100 shadow-glow-primary"
                            >
                                Play Now
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={onSignUpClick}
                                    className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 rounded-lg text-sm transition"
                                >
                                    Sign Up Now
                                </button>
                                <span className="text-text-muted">or join with</span>
                                <button className="g-button" onClick={onGoogleSignInClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262" className="g-svg">
                                    <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" className="g-blue"></path>
                                    <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" className="g-green"></path>
                                    <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" className="g-yellow"></path>
                                    <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" className="g-red"></path>
                                  </svg>
                                  <span className="g-text">Continue with Google</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};