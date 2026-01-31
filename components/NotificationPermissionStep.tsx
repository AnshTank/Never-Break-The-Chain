'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Smartphone, Clock, Target, Sparkles, ArrowRight, X } from 'lucide-react';
import { useNotifications } from '@/lib/notifications/use-notifications';
import { toast } from 'sonner';

interface NotificationPermissionStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function NotificationPermissionStep({ onComplete, onSkip }: NotificationPermissionStepProps) {
  const { enableNotifications, sendWelcomeNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await enableNotifications();
      if (granted) {
        // Send immediate welcome notification
        await sendWelcomeNotification();
        toast.success('🎉 Smart notifications enabled! You\'ll get motivational reminders.');
        onComplete();
      } else {
        toast.error('Notifications blocked. You can enable them later in settings.');
        onSkip();
      }
    } catch (error) {
      toast.error('Failed to enable notifications');
      onSkip();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 md:px-12 lg:px-24 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Bell className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Stay Connected to Your Goals
          </h2>
          
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Get smart, personalized reminders that learn your habits and help you never break the chain.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              {
                icon: Clock,
                title: 'Morning Motivation',
                desc: '7 AM daily boost to start strong',
                color: 'from-orange-400 to-red-400'
              },
              {
                icon: Target,
                title: 'Evening Check-in',
                desc: '8 PM progress review & insights',
                color: 'from-green-400 to-emerald-400'
              },
              {
                icon: Sparkles,
                title: 'Smart Patterns',
                desc: 'AI learns your habits & timing',
                color: 'from-purple-400 to-pink-400'
              },
              {
                icon: Smartphone,
                title: 'Cross-Device',
                desc: 'Works on desktop & mobile',
                color: 'from-blue-400 to-cyan-400'
              }
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-white/70 text-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Browser Support Check */}
          <div className="mb-8">
            {'Notification' in window ? (
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Your browser supports notifications
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Limited notification support in this browser
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Enable Smart Notifications
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSkip}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Skip for Now
            </motion.button>
          </div>

          {/* Info Text */}
          <p className="text-white/60 text-xs mt-6 max-w-md mx-auto">
            You can always change notification settings later in your profile menu. 
            We respect your privacy and only send helpful reminders.
          </p>
        </motion.div>
      </div>
    </div>
  );
}