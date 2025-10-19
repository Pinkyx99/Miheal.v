
import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-16 py-8 px-6 bg-card-bg/50 border border-outline rounded-lg text-center">
      <h3 className="text-xl font-bold font-display text-accent-orange mb-4">Disclaimer</h3>
      <div className="space-y-3 text-sm text-text-muted">
        <p>
          This website is a fan-made project created for demonstration and educational purposes only, inspired by the design and functionality of <a href="https://gamdom.com" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Gamdom.com</a>.
        </p>
        <p>
          It is <strong className="text-white/80">not affiliated with, associated with, authorized, endorsed by, or in any way officially connected with Gamdom</strong> or any of its subsidiaries or affiliates. The official Gamdom website can be found at <a href="https://gamdom.com" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">gamdom.com</a>.
        </p>
        <p>
          All gameplay on this site is <strong className="text-white/80">simulated</strong>. No real money is involved, can be deposited, or can be won. This platform is a visual user interface prototype and does not offer any real-money gambling services.
        </p>
      </div>
    </div>
  );
};
