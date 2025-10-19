import React, { useState } from 'react';

interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked = false, onChange }) => {
    const [isOn, setIsOn] = useState(checked);

    const handleToggle = () => {
        const newState = !isOn;
        setIsOn(newState);
        if (onChange) {
            onChange(newState);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isOn ? 'bg-accent-green' : 'bg-background'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
};
