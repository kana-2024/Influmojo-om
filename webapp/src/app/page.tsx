'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [activeDot] = useState(0);

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/onboarding-img.webp"
          alt="Influencer Marketing"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-end">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-primary rounded-t-3xl p-6 shadow-soft"
          >
            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-title font-alice-italic font-semibold text-textDark text-center mb-3"
            >
              Connect with Skilled Influencers
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-body font-poppins text-textGray text-center mb-6 leading-relaxed"
            >
              Tap into a pool of talented influencers to bring your projects to life. 
              Collaborate seamlessly and achieve outstanding results.
            </motion.p>

            {/* Dots Indicator */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex justify-center mb-6"
            >
              <div className="flex space-x-2">
                <div className={`w-4 h-2 rounded-full transition-all duration-300 ${
                  activeDot === 0 ? 'bg-tertiary w-8' : 'bg-tertiary'
                }`} />
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeDot === 1 ? 'bg-tertiary w-8' : 'bg-tertiary'
                }`} />
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeDot === 2 ? 'bg-tertiary w-8' : 'bg-tertiary'
                }`} />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex space-x-3"
            >
              <Link
                href="/get-started"
                className="flex-1 bg-secondary text-white font-poppins-medium py-4 px-6 rounded-lg text-center hover:bg-opacity-90 transition-all duration-200"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="flex-1 border-2 border-secondary text-secondary font-poppins-medium py-4 px-6 rounded-lg text-center hover:bg-secondary hover:text-white transition-all duration-200"
              >
                Log In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 