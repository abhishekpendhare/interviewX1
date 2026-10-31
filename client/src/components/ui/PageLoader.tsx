import { motion } from 'framer-motion'

export function PageLoader() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gold-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">⚡</div>
        </div>
        <div className="flex gap-1">
          {['I','n','t','e','r','v','i','e','w','X'].map((char, i) => (
            <motion.span
              key={i}
              className="text-sm font-display font-bold text-gradient-gold"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: `${[100, 85, 70][i % 3]}%` }}
        />
      ))}
    </div>
  )
}
