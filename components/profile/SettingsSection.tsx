import React from 'react';
import { SectionShell } from './shared/SectionShell';
import { Switch } from './shared/Switch';

export const SettingsSection: React.FC = () => {
    return (
        <SectionShell title="Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-text-muted uppercase">Languages</label>
                        <select className="w-full bg-background border border-outline rounded-md p-3 mt-2 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none">
                            <option>English</option>
                            <option>Spanish</option>
                            <option>German</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-text-muted uppercase">Chat History Length</label>
                         <input type="number" defaultValue={50} className="w-full bg-background border border-outline rounded-md p-3 mt-2 text-sm focus:ring-1 focus:ring-accent-green focus:outline-none"/>
                    </div>
                    <div className="space-y-4 pt-4">
                         <div className="flex items-center justify-between">
                            <p className="text-white">Disable Rain 15 Minute Chat Pop-up Notification</p>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-white">Enable Ambient Mode on Casino Games</p>
                            <Switch checked={true} />
                        </div>
                         <div className="flex items-center justify-between">
                            <p className="text-white">Receive News and Offers</p>
                            <Switch />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                     <div>
                        <h3 className="text-sm font-semibold text-text-muted uppercase mb-2">Two-Factor Authentication</h3>
                        <div className="bg-card-bg/50 border border-outline rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-white">2FA Disabled</p>
                                <p className="text-xs text-text-muted">Secure your account with 2FA</p>
                            </div>
                            <button className="bg-accent-green text-white font-semibold px-4 py-2 rounded-md text-sm transition-opacity hover:opacity-90">
                                Enable 2FA
                            </button>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-text-muted uppercase mb-2">Self exclusion</h3>
                         <p className="text-xs text-text-muted mb-3">You can use this feature to exclude yourself from gambling & depositing until your restriction expires while still being able to do other activities such as withdrawing or chatting.</p>
                         <div className="flex items-center space-x-2">
                             {['1 day', '5 days', '8 days'].map(day => (
                                 <button key={day} className="flex-1 bg-background border border-outline rounded-md p-2 text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors">{day}</button>
                             ))}
                         </div>
                          <div className="mt-4 flex items-start space-x-3 bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
                            <span className="text-red-400 mt-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                            </span>
                            <p className="text-xs text-red-300">Please note that this self-exclusion request WILL NOT be lifted even if you change your mind later on.</p>
                         </div>
                    </div>
                </div>
            </div>
        </SectionShell>
    );
};
