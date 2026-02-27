import { createContext, useContext, useState, useEffect } from "react";

type Theme = 'light'|'dark';
interface ThemeContextType{
    theme: Theme;
    onToggle: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider:React.FC< {children : React.ReactNode} > = ( {children} ) => {
    const [theme , setTheme] = useState<Theme>('dark');

    
    const onToggle = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark':'light')
    };

    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);
    return(
        <ThemeContext.Provider value={{theme , onToggle}}>
           {children}
        </ThemeContext.Provider>
    )
}
export const useTheme = () =>{
    const context = useContext(ThemeContext);
    if(context === undefined){
       throw new Error('useTheme is not used within a ThemeProvider')
    }
    return context
}