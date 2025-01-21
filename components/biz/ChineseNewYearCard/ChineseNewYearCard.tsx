import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChineseNewYearCardProps } from "./interface";
import { getRandomWish } from "./helpers";

const ChineseNewYearCard: React.FC<ChineseNewYearCardProps> = () => {
  const [isRedPacketOpen, setIsRedPacketOpen] = useState(false);
  const [wish] = useState(getRandomWish);

  return (
    <Card className="relative w-full max-w-md mx-auto bg-gradient-to-b from-red-600 to-red-700 text-gold-500 p-8 rounded-2xl shadow-2xl overflow-hidden">
      {/* Snake Scale Pattern Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.5 }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="snakeScales"
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(0)"
              >
                <path
                  d="M0 20 A20 20 0 0 1 40 20 A20 20 0 0 1 0 20z M-20 20 A20 20 0 0 1 20 20 A20 20 0 0 1 -20 20z M20 20 A20 20 0 0 1 60 20 A20 20 0 0 1 20 20z M0 -20 A20 20 0 0 1 40 -20 A20 20 0 0 1 0 -20z M0 60 A20 20 0 0 1 40 60 A20 20 0 0 1 0 60z"
                  fill="none"
                  stroke="url(#scaleGradient)"
                  strokeWidth="1"
                />
              </pattern>
              <linearGradient id="scaleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#FFA500" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FFD700" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#snakeScales)" />
          </svg>
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="space-y-2">
          <motion.div
            className="text-yellow-100 text-lg tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            灵蛇携福至
          </motion.div>
          <motion.div
            className="text-yellow-200/80 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            己己好运来
          </motion.div>
        </div>

        {/* Main Title */}
        <motion.div
          className="py-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-yellow-300 mb-2 brush-stroke">
            蛇年行大运
          </h1>
          <p className="text-yellow-100/80 text-sm tracking-widest">
            蛇年大吉
          </p>
        </motion.div>

        {/* Footer Text */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-yellow-200 text-sm">
            二零二五年正月廿九
          </div>
          <div className="text-yellow-100 flex items-center justify-center gap-2">
            <span>•</span>
            <span>蛇舞新春 蛇年福顺</span>
            <span>•</span>
          </div>
          <div className="text-yellow-200/70 text-xs">
            金蛇献瑞，万象更新
          </div>
        </motion.div>

        {/* Red Packet Button */}
        <motion.div
          className="pt-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsRedPacketOpen(true)}
            className="bg-yellow-500/90 hover:bg-yellow-400 text-red-800 font-bold px-8 py-4 rounded-full shadow-lg"
          >
            领取新春祝福
          </Button>
        </motion.div>
      </motion.div>

      {/* Firework Decorations */}
      <motion.div
        className="absolute top-4 right-4 text-yellow-300/20 text-2xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        ✨
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-4 text-yellow-300/20 text-2xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        ✨
      </motion.div>

      {/* Red Packet Dialog */}
      <Dialog open={isRedPacketOpen} onOpenChange={setIsRedPacketOpen}>
        <DialogContent className="bg-gradient-to-b from-red-600 to-red-700 border-2 border-yellow-300/50">
          <DialogHeader>
            <DialogTitle className="text-center text-yellow-300 text-2xl brush-stroke">
              新春祝福
            </DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 text-center text-yellow-100 text-xl"
          >
            {wish}
          </motion.div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .brush-stroke {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </Card>
  );
};

export default ChineseNewYearCard;