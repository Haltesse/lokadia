import { motion } from "motion/react";

interface NumbeoLoadingIndicatorProps {
  message?: string;
}

export function NumbeoLoadingIndicator({ message = "Chargement des données de sécurité..." }: NumbeoLoadingIndicatorProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Spinner animé */}
        <motion.div
          className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <div className="flex-1">
          {/* Texte animé */}
          <motion.p
            className="text-sm font-medium text-blue-900"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {message}
          </motion.p>
          <p className="text-xs text-blue-600 mt-1">
            Source: Numbeo Safety Index
          </p>
        </div>
      </div>
      
      {/* Barre de progression animée */}
      <div className="mt-4 h-1 bg-blue-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
