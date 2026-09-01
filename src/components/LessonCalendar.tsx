import { useMemo, useState } from 'react'
import type {
  ClassPeriod,
  DayType,
  Lesson,
  LessonAssignment,
  SchoolDay,
  Subject,
} from '../types/classroom'

type LessonCalendarProps = {
  subjects: Subject[]
  periods: ClassPeriod[]
  lessons: Lesson[]
  lessonAssignments: LessonAssignment[]
  schoolDays: SchoolDay[]

  onSetSchoolDay: (
    date: string,
    dayType: DayType | 'none',
  ) => void

  onAssignLesson: (
    date: string,
    periodId: string,
    lessonId: string,
  ) => void

  onShiftLessons: (
    startDate: string,
    dayType: DayType,
    periodId?: string,
  ) => void
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function LessonCalendar({
  subjects,
  periods,
  lessons,
  lessonAssignments,
  schoolDays,
  onSetSchoolDay,
  onAssignLesson,
  onShiftLessons,
}: LessonCalendarProps) {
  const today = new Date()

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const [selectedDate, setSelectedDate] = useState(
    formatDateKey(today),
  )

  const selectedSchoolDay = schoolDays.find(
    (day) => day.date === selectedDate,
  )

  const selectedDayType = selectedSchoolDay?.dayType ?? 'none'

  const monthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(viewYear, viewMonth, 1))

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)

    const days: Array<Date | null> = []

    const firstWeekday = firstDay.getDay()

    for (let i = 0; i < firstWeekday; i++) {
      days.push(null)
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(viewYear, viewMonth, day))
    }

    return days
  }, [viewYear, viewMonth])

  function changeMonth(amount: number) {
    const next = new Date(viewYear, viewMonth + amount, 1)

    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const visiblePeriods =
    selectedDayType === 'none'
      ? []
      : periods.filter(
          (period) =>
            period.day === selectedDayType &&
            period.type === 'class',
        )

  return (
    <main className="calendar-page">
      <section className="calendar-panel">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>
            ←
          </button>

          <h2>{monthName}</h2>

          <button onClick={() => changeMonth(1)}>
            →
          </button>
        </div>

        <div className="calendar-weekdays">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="calendar-grid">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  className="calendar-empty"
                  key={`empty-${index}`}
                />
              )
            }

            const dateKey = formatDateKey(date)

            const schoolDay = schoolDays.find(
              (day) => day.date === dateKey,
            )

            const isSelected = dateKey === selectedDate

            return (
              <button
                key={dateKey}
                className={
                  isSelected
                    ? 'calendar-day selected'
                    : 'calendar-day'
                }
                onClick={() => setSelectedDate(dateKey)}
              >
                <strong>{date.getDate()}</strong>

                {schoolDay?.dayType === 'A' && (
                  <span className="day-badge">
                    A
                  </span>
                )}

                {schoolDay?.dayType === 'B' && (
                  <span className="day-badge">
                    B
                  </span>
                )}

                {schoolDay?.dayType === 'none' && (
                  <span className="no-school-label">
                    —
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="calendar-day-editor">
        <h2>
          {new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }).format(
            new Date(`${selectedDate}T12:00:00`),
          )}
        </h2>

        <div className="day-type-controls">
          <span>Schedule:</span>

          <button
            className={selectedDayType === 'A' ? 'active' : ''}
            onClick={() =>
              onSetSchoolDay(selectedDate, 'A')
            }
          >
            A Day
          </button>

          <button
            className={selectedDayType === 'B' ? 'active' : ''}
            onClick={() =>
              onSetSchoolDay(selectedDate, 'B')
            }
          >
            B Day
          </button>

          <button
            className={
              selectedDayType === 'none' ? 'active' : ''
            }
            onClick={() =>
              onSetSchoolDay(selectedDate, 'none')
            }
          >
            No School
          </button>
        </div>

        {selectedDayType === 'none' ? (
        <div className="calendar-empty-state">
            Select A Day or B Day to assign lessons.
        </div>
        ) : (
        <>
            <div className="calendar-shift-tools">
            <div>
                <strong>Schedule adjustments</strong>

                <span>
                Move lessons from this date forward by one{' '}
                {selectedDayType} Day.
                </span>
            </div>

            <button
                type="button"
                onClick={() => {
                const confirmed = window.confirm(
                    `Shift ALL ${selectedDayType} Day classes from this date forward by one ${selectedDayType} Day?\n\nThe other day type will not be changed.`,
                )

                if (!confirmed) return

                onShiftLessons(
                    selectedDate,
                    selectedDayType,
                )
                }}
            >
                Shift Entire Day →
            </button>
            </div>

            <div className="calendar-period-list">
            {visiblePeriods.map((period) => {
                const subject = subjects.find(
                (item) => item.id === period.subjectId,
                )

                const availableLessons = lessons.filter(
                (lesson) =>
                    lesson.subjectId === period.subjectId,
                )

                const assignment = lessonAssignments.find(
                (item) =>
                    item.date === selectedDate &&
                    item.periodId === period.id,
                )

                return (
                <div
                    className="calendar-period"
                    key={period.id}
                    style={{
                    borderLeftColor: period.accent,
                    }}
                >
                    <div className="calendar-period-heading">
                    <div>
                        <strong>
                        Period {period.number}
                        </strong>

                        <span>
                        {subject?.name ?? 'No Subject'}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="period-shift-button"
                        onClick={() => {
                        const confirmed = window.confirm(
                            `Shift Period ${period.number} from this date forward by one ${selectedDayType} Day?\n\nOther periods and all ${
                            selectedDayType === 'A' ? 'B' : 'A'
                            } Days will remain unchanged.`,
                        )

                        if (!confirmed) return

                        onShiftLessons(
                            selectedDate,
                            selectedDayType,
                            period.id,
                        )
                        }}
                    >
                        Shift P{period.number} →
                    </button>
                    </div>

                    <select
                    value={assignment?.lessonId ?? ''}
                    disabled={!period.subjectId}
                    onChange={(event) =>
                        onAssignLesson(
                        selectedDate,
                        period.id,
                        event.target.value,
                        )
                    }
                    >
                    <option value="">
                        No lesson assigned
                    </option>

                    {Array.from(
                        new Set(
                        availableLessons
                            .map((lesson) => lesson.unit)
                            .filter(Boolean),
                        ),
                    ).map((unit) => (
                        <optgroup
                        key={unit}
                        label={unit}
                        >
                        {availableLessons
                            .filter(
                            (lesson) =>
                                lesson.unit === unit,
                            )
                            .map((lesson) => (
                            <option
                                key={lesson.id}
                                value={lesson.id}
                            >
                                {lesson.code
                                ? `${lesson.code} — `
                                : ''}
                                {lesson.name}
                            </option>
                            ))}
                        </optgroup>
                    ))}

                    {availableLessons
                        .filter((lesson) => !lesson.unit)
                        .map((lesson) => (
                        <option
                            key={lesson.id}
                            value={lesson.id}
                        >
                            {lesson.code
                            ? `${lesson.code} — `
                            : ''}
                            {lesson.name}
                        </option>
                        ))}
                    </select>
                </div>
                )
            })}
            </div>
        </>
        )}
      </section>
    </main>
  )
}

export default LessonCalendar