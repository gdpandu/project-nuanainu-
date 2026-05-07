"use client"

import { motion } from "framer-motion"
import { MessageCircle } from "lucide-react"

interface TelegramFabProps {
  telegramUrl?: string
}

export function TelegramFab({ telegramUrl = "https://t.me/nuanu_support" }: TelegramFabProps) {
  return (
    <motion.a
      href={telegramUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5 
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-4 z-50 flex items-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium">Ask Information</span>
    </motion.a>
  )
}
