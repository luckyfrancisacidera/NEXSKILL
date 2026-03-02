import React from 'react';

type ToastType = 'success' | 'failed' | 'information';

interface ToastProps {
    title: string;
    detail: string;
    type: ToastType;
    visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ title, detail, type, visible }) => {

    const styles = {
        success: {
            accent:    'bg-green-500',
            badge:     'bg-green-50 text-green-700',
            badgeText: 'Success',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#22c55e"/>
                    <path d="M6 10.5l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            ),
        },
        failed: {
            accent:    'bg-red-500',
            badge:     'bg-red-50 text-red-700',
            badgeText: 'Failed',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#ef4444"/>
                    <path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
            ),
        },
        information: {
            accent:    'bg-blue-500',
            badge:     'bg-blue-50 text-blue-700',
            badgeText: 'Info',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="#3b82f6"/>
                    <path d="M10 9v5M10 7v.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            ),
        },
    };

    const current = styles[type];

    return (
       
        <div className={`font-inter
            fixed top-6 right-6 z-50
            transition-all duration-500 ease-out
            ${visible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
            }
        `}>
            <div className="
                bg-white rounded-2xl overflow-hidden py-0
                shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                border border-black/5
                w-[320px]
            ">
               
                <div />

               
                <div className="flex items-start gap-3 px-4 py-3">

                  
                    <div className="mt-0.5 shrink-0">
                        {current.icon}
                    </div>

                   
                    <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">
                                {title}
                            </p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${current.badge}`}>
                                {current.badgeText}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            {detail}
                        </p>
                    </div>

                </div>

               
                <div className="h-0.5 bg-gray-100">
                    <div className={`
                        h-full ${current.accent} opacity-40
                        ${visible
                            ? 'w-0 transition-all duration-[3000ms] ease-linear'
                            : 'w-full'
                        }
                    `}/>
                </div>

            </div>
        </div>
    );
};