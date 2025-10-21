import React from 'react';
import { SectionShell } from './shared/SectionShell';
import { Switch } from './shared/Switch';

export const SettingsSection: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <SectionShell title="Preferences">
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-text-muted uppercase">Language</label>
                            <select className="form-input">
                                <option>English</option>
                                <option>Spanish</option>
                                <option>German</option>
                            </select>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-outline">
                             <div className="flex items-center justify-between">
                                <p className="text-white font-semibold">Enable Ambient Mode</p>
                                <Switch checked={true} />
                            </div>
                             <div className="flex items-center justify-between">
                                <p className="text-white font-semibold">Receive News and Offers</p>
                                <Switch />
                            </div>
                        </div>
                    </div>
                </SectionShell>
                 <SectionShell title="Security">
                     <div className="bg-card-bg/50 border border-outline rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-white">Two-Factor Authentication</p>
                            <p className="text-sm text-text-muted">Your account is not protected.</p>
                        </div>
                        <button className="bg-primary text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors hover:bg-primary-light">
                            Enable 2FA
                        </button>
                    </div>
                 </SectionShell>
            </div>
            
            <SectionShell title="Responsible Gaming">
                 <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-white mb-2">Self Exclusion</h3>
                         <p className="text-sm text-text-muted mb-4">Exclude yourself from gambling & depositing for a set period. You can still withdraw and chat.</p>
                         <div className="grid grid-cols-3 gap-2">
                             {['1 day', '7 days', '30 days'].map(day => (
                                 <button key={day} className="flex-1 bg-background border border-outline rounded-md p-2.5 text-sm text-text-muted hover:bg-white/5 hover:text-white transition-colors">{day}</button>
                             ))}
                         </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                        <span className="text-red-400 mt-0.5">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                        </span>
                        <p className="text-sm text-red-300">Please note that self-exclusion cannot be lifted even if you change your mind.</p>
                     </div>
                </div>
            </SectionShell>
        </div>
    );
};