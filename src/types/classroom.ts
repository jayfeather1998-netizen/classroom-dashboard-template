export type DayType = 'A' | 'B'

export type ScheduleMode =
  | 'block'
  | 'standard'

export type ScheduleSettings = {
  mode: ScheduleMode
  standardPeriodCount: number
  aDayPeriodCount: number
  bDayPeriodCount: number
}

export type PeriodType = 'class' | 'prep'

export type Subject = {
  id: string
  name: string
}

export type ClassPeriod = {
  id: string
  number: number
  day: DayType
  type: PeriodType
  subjectId: string | null
  colorName: string
  accent: string
  light: string
  text: string
}

export type Lesson = {
  id: string
  subjectId: string
  unit: string
  code: string
  name: string
  learningTarget: string
  instructions: string
  homework: string
  warmUp: string
}

export type LessonAssignment = {
  id: string
  date: string
  periodId: string
  lessonId: string
}

export type SchoolDay = {
  date: string
  dayType: DayType | 'none'
}

export type Student = {
  id: string
  periodId: string
  firstName: string
  lastInitial: string
}

export type ForbiddenPair = {
  id: string
  periodId: string
  studentId1: string
  studentId2: string
}

export type SeatingLayoutMode =
  | 'groupCount'
  | 'groupSize'

export type SeatingChart = {
  periodId: string
  assignments: Record<string, string | null>
  blockedSeatIds: string[]

  layoutMode: SeatingLayoutMode
  groupCount: number
  groupSize: number
}