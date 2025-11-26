import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const message = "Olá! Vim pelo site e gostaria de mais informações sobre os serviços de despachante.";
    window.open(`https://wa.me/5522992090682?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Pulsing animation ring */}
        <div className="absolute -inset-2 bg-success-green/30 rounded-full animate-pulse"></div>
        
        {/* Main button */}
        <button
          onClick={handleClick}
          className="relative bg-success-green hover:bg-success-green/90 text-white w-14 h-14 rounded-full shadow-large hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-medium">
            Fale conosco!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>

      {/* Welcome message bubble */}
      <div className="absolute bottom-16 right-0 mr-2 bg-white p-4 rounded-2xl shadow-large max-w-xs animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-800 font-medium mb-1">
              Olá! 👋
            </p>
            <p className="text-xs text-gray-600">
              Precisa de ajuda com documentos? Estamos online!
            </p>
          </div>
        </div>
        
        {/* Arrow pointing to button */}
        <div className="absolute bottom-0 right-8 transform translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
      </div>
    </div>
  );
};

export default FloatingWhatsApp;