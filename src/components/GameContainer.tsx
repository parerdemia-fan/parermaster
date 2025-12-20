import type { ReactNode } from 'react';

interface GameContainerProps {
  children: ReactNode;
}

export function GameContainer({ children }: GameContainerProps) {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div 
        className="flex flex-col items-center justify-center"
        style={{
          width: 'min(100vw, 133vh)',
          height: 'min(100vw, 100vh)',
          //background: 'linear-gradient(to bottom, rgba(16, 21, 48, 0.95) 0%, rgba(25, 32, 70, 0.95) 30%, rgba(35, 45, 90, 0.95) 100%)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
