import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "917520560526";
const MESSAGE = encodeURIComponent("👋 Hi Anurag! I found you on Montage. I'd like to discuss a project.");

export function WhatsAppFAB() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_24px_rgba(37,211,102,0.5)] hover:shadow-[0_0_36px_rgba(37,211,102,0.7)] transition-shadow"
      style={{ background: "#25D366" }}
      title="Chat on WhatsApp"
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.655 4.83 1.8 6.858L2 30l7.322-1.775A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.83-1.594l-.418-.248-4.34 1.052 1.082-4.226-.272-.435A11.47 11.47 0 0 1 4.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.61c-.345-.172-2.04-1.006-2.355-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.745.086-.345-.172-1.456-.537-2.773-1.711-1.025-.915-1.716-2.044-1.917-2.389-.2-.345-.021-.531.15-.703.155-.154.345-.4.518-.6.172-.2.23-.345.345-.575.115-.23.057-.431-.029-.603-.086-.172-.776-1.87-1.063-2.562-.28-.673-.564-.582-.776-.593l-.66-.011c-.23 0-.603.086-.919.431-.316.345-1.205 1.178-1.205 2.873 0 1.695 1.234 3.332 1.406 3.562.172.23 2.428 3.707 5.882 5.197.822.354 1.463.566 1.963.724.824.262 1.574.225 2.167.136.661-.1 2.04-.833 2.327-1.638.287-.805.287-1.494.2-1.638-.086-.144-.316-.23-.66-.402z"/>
      </svg>

      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#25D366" }} />
    </motion.a>
  );
}
