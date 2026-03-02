import { createContext, useState, useContext } from "react";
import {Toast} from '@shared/components/Toast'
type ToastType = 'success'|'failed'|'information'
interface ToastContextType{
    showToast: (title: string, detail: string, type:ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{children : React.ReactNode}> = ({children}) =>{
    const [title, setTitle] = useState<string>('');
    const [detail, setDetail] = useState<string>('');
    const [type, setType] = useState<ToastType>('success');
    const [visible, setVisible]= useState<boolean>(false);

    const showToast = (toastTitle: string, toastDetail: string, toastType: ToastType) => {
        setTitle(toastTitle);
        setDetail(toastDetail);
        setType(toastType);
        setVisible(true);
        
        // Auto-hide after 3 seconds
        setTimeout(() => setVisible(false), 3000);
    }
    return(
        <ToastContext.Provider value={{showToast}}>
            {children}
            <Toast title={title} detail={detail} type={type} visible={visible}></Toast>
        </ToastContext.Provider>
    )
    
} 
export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}



