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
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                isOn ? 'bg-primary' : 'bg-background'
            }`}
            role="switch"
            aria-checked={isOn}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isOn ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
};