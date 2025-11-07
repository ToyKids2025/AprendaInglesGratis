/**
 * LOADING SKELETON COMPONENTS
 * Reusable skeleton loaders for better UX while content loads
 */

// Base skeleton animation
const skeletonClass = 'animate-pulse bg-gray-200 rounded'

/**
 * Card skeleton - for dashboard cards, lesson cards, etc
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className={`${skeletonClass} h-6 w-3/4`}></div>
      <div className={`${skeletonClass} h-4 w-1/2`}></div>
      <div className={`${skeletonClass} h-20 w-full`}></div>
      <div className="flex gap-2">
        <div className={`${skeletonClass} h-8 w-24`}></div>
        <div className={`${skeletonClass} h-8 w-24`}></div>
      </div>
    </div>
  )
}

/**
 * List item skeleton - for leaderboards, achievements, etc
 */
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
      <div className={`${skeletonClass} h-12 w-12 rounded-full flex-shrink-0`}></div>
      <div className="flex-1 space-y-2">
        <div className={`${skeletonClass} h-5 w-1/3`}></div>
        <div className={`${skeletonClass} h-4 w-1/2`}></div>
      </div>
      <div className={`${skeletonClass} h-8 w-16`}></div>
    </div>
  )
}

/**
 * Table skeleton - for admin panel, user tables, etc
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 flex gap-4">
        <div className={`${skeletonClass} h-5 w-32`}></div>
        <div className={`${skeletonClass} h-5 w-40`}></div>
        <div className={`${skeletonClass} h-5 w-24`}></div>
        <div className={`${skeletonClass} h-5 w-20`}></div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-t border-gray-100 flex gap-4">
          <div className={`${skeletonClass} h-4 w-32`}></div>
          <div className={`${skeletonClass} h-4 w-40`}></div>
          <div className={`${skeletonClass} h-4 w-24`}></div>
          <div className={`${skeletonClass} h-4 w-20`}></div>
        </div>
      ))}
    </div>
  )
}

/**
 * Stats card skeleton - for dashboard statistics
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${skeletonClass} h-8 w-8 rounded-lg`}></div>
        <div className={`${skeletonClass} h-4 w-16`}></div>
      </div>
      <div className={`${skeletonClass} h-8 w-24 mb-2`}></div>
      <div className={`${skeletonClass} h-4 w-32`}></div>
    </div>
  )
}

/**
 * Profile skeleton - for user profiles
 */
export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-8">
      <div className="flex items-center gap-6 mb-8">
        <div className={`${skeletonClass} h-24 w-24 rounded-full`}></div>
        <div className="flex-1 space-y-3">
          <div className={`${skeletonClass} h-8 w-48`}></div>
          <div className={`${skeletonClass} h-4 w-64`}></div>
          <div className={`${skeletonClass} h-4 w-40`}></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className={`${skeletonClass} h-10 w-20 mx-auto mb-2`}></div>
            <div className={`${skeletonClass} h-4 w-24 mx-auto`}></div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`${skeletonClass} h-6 w-6 rounded`}></div>
            <div className={`${skeletonClass} h-4 w-48`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Lesson card skeleton
 */
export function LessonCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className={`${skeletonClass} h-6 w-3/4`}></div>
          <div className={`${skeletonClass} h-4 w-1/2`}></div>
        </div>
        <div className={`${skeletonClass} h-12 w-12 rounded-lg`}></div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <div className={`${skeletonClass} h-4 w-24`}></div>
          <div className={`${skeletonClass} h-4 w-16`}></div>
        </div>
        <div className={`${skeletonClass} h-2 w-full rounded-full`}></div>
      </div>

      <div className="flex gap-2">
        <div className={`${skeletonClass} h-10 flex-1`}></div>
        <div className={`${skeletonClass} h-10 w-10 rounded-lg`}></div>
      </div>
    </div>
  )
}

/**
 * Achievement badge skeleton
 */
export function AchievementSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className={`${skeletonClass} h-20 w-20 rounded-full mx-auto mb-4`}></div>
      <div className={`${skeletonClass} h-6 w-32 mx-auto mb-2`}></div>
      <div className={`${skeletonClass} h-4 w-full mb-3`}></div>
      <div className={`${skeletonClass} h-2 w-full rounded-full mb-2`}></div>
      <div className={`${skeletonClass} h-4 w-20 mx-auto`}></div>
    </div>
  )
}

/**
 * Generic full-page skeleton
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className={`${skeletonClass} h-10 w-64`}></div>
          <div className={`${skeletonClass} h-5 w-96`}></div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Inline text skeleton - for small loading states
 */
export function TextSkeleton({ width = 'w-24' }: { width?: string }) {
  return <div className={`${skeletonClass} h-4 ${width} inline-block`}></div>
}

/**
 * Button skeleton
 */
export function ButtonSkeleton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <div
      className={`${skeletonClass} h-10 rounded-lg ${
        fullWidth ? 'w-full' : 'w-32'
      }`}
    ></div>
  )
}

export default {
  Card: CardSkeleton,
  ListItem: ListItemSkeleton,
  Table: TableSkeleton,
  StatsCard: StatsCardSkeleton,
  Profile: ProfileSkeleton,
  LessonCard: LessonCardSkeleton,
  Achievement: AchievementSkeleton,
  Page: PageSkeleton,
  Text: TextSkeleton,
  Button: ButtonSkeleton,
}
