import type { CSSProperties } from 'react'

import type {
  ClassPeriod,
  Lesson,
  SeatingChart,
  Student,
  Subject,
} from '../types/classroom'

import { createSeatingGroups } from '../data/seating'

type DisplayModeProps = {
  selectedPeriod: ClassPeriod
  selectedSubject?: Subject
  lesson?: Lesson
  availablePeriods: ClassPeriod[]
  selectedPeriodId: string
  dayOfWeek: string
  date: string
  showPinPrompt: boolean
  pinEntry: string
  pinError: string
  onSelectPeriod: (periodId: string) => void
  onOpenPin: () => void
  onClosePin: () => void
  onPinChange: (value: string) => void
  onUnlockTeacherMode: () => void
  students: Student[]
  seatingChart?: SeatingChart
  onRequestSeatingRandomize: () => void
}

function DisplayMode({
  selectedPeriod,
  selectedSubject,
  lesson,
  students,
  seatingChart,
  availablePeriods,
  selectedPeriodId,
  dayOfWeek,
  date,
  showPinPrompt,
  pinEntry,
  pinError,
  onSelectPeriod,
  onOpenPin,
  onClosePin,
  onPinChange,
  onUnlockTeacherMode,
  onRequestSeatingRandomize,
}: DisplayModeProps) {
  const currentStudents = students.filter(
    (student) =>
      student.periodId === selectedPeriodId,
  )

  const groupCount =
    seatingChart?.groupCount ?? 9

  const groupSize =
    seatingChart?.groupSize ?? 4

  const seatingGroups =
    createSeatingGroups(groupCount)

  return (
    <div
      className="display-mode"
      style={
        {
          '--period-accent': selectedPeriod.accent,
          '--period-light': selectedPeriod.light,
          '--period-text': selectedPeriod.text,
        } as CSSProperties
      }
    >
      <header className="display-header">
        <div className="date-block">
          <strong>{dayOfWeek}</strong>
          <span>{date}</span>
        </div>

        <div className="class-title">
          <strong>
            {selectedSubject?.name ?? 'No Subject'}
          </strong>

          <span>
            Period {selectedPeriod.number}
          </span>
        </div>

        <div className="display-controls">
          <div className="period-buttons">
            {availablePeriods.map((period) => (
              <button
                key={period.id}
                className={
                  period.id === selectedPeriodId
                    ? 'period-button active'
                    : 'period-button'
                }
                onClick={() =>
                  onSelectPeriod(period.id)
                }
                style={{
                  backgroundColor: period.accent,
                  color: period.text,
                }}
              >
                P{period.number}
              </button>
            ))}
          </div>

          <button
            className="teacher-button"
            onClick={onOpenPin}
          >
            Teacher
          </button>
        </div>
      </header>

      {showPinPrompt && (
        <div className="pin-overlay">
          <div className="pin-box">
            <h2>Teacher Access</h2>

            <p>Enter teacher PIN</p>

            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pinEntry}
              onChange={(event) =>
                onPinChange(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onUnlockTeacherMode()
                }
              }}
            />

            {pinError && (
              <p className="pin-error">
                {pinError}
              </p>
            )}

            <div className="pin-actions">
              <button
                className="pin-cancel"
                onClick={onClosePin}
              >
                Cancel
              </button>

              <button
                className="pin-submit"
                onClick={onUnlockTeacherMode}
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="dashboard-grid">
        <section className="dashboard-card lesson-card">
          <h2>Today's Lesson</h2>

          <div className="card-content">
            {lesson?.name || 'No lesson assigned'}
          </div>
        </section>

        <section className="dashboard-card target-card">
          <h2>Learning Target</h2>

          <div className="card-content">
            {lesson?.learningTarget || '—'}
          </div>
        </section>

        <section className="display-card seating-card">
          <h2
            style={{
              color:
                selectedPeriod?.accent ??
                '#333333',
              fontWeight: 900,
              filter: 'brightness(0.65)',
            }}
          >
            Seating Chart
          </h2>

          <div className="student-seating-grid">
            {seatingGroups.map((group) => {
              const groupSeatIds =
                Array.from(
                  {
                    length: groupSize,
                  },
                  (_, index) =>
                    `g${group.groupNumber}-s${index + 1}`,
                )

              return (
                <div
                  key={group.groupNumber}
                  className="student-seating-group"
                  style={{
                    borderColor:
                      group.color,
                    backgroundColor:
                      group.light,
                  }}
                >
                  <div className="student-group-names">
                    {groupSeatIds.map(
                      (seatId) => {
                        const blocked =
                          seatingChart?.blockedSeatIds.includes(
                            seatId,
                          ) ?? false

                        if (blocked) {
                          return null
                        }

                        const studentId =
                          seatingChart
                            ?.assignments[
                            seatId
                          ]

                        const assignedStudent =
                          currentStudents.find(
                            (student) =>
                              student.id ===
                              studentId,
                          )

                        return (
                          <div
                            key={seatId}
                            className="student-seat-name"
                          >
                            {assignedStudent
                              ? `${assignedStudent.firstName} ${assignedStudent.lastInitial}.`
                              : '—'}
                          </div>
                        )
                      },
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            className="display-randomize-button"
            style={{
              backgroundColor:
                selectedPeriod?.accent ??
                '#555555',
              color:
                selectedPeriod?.text ??
                '#ffffff',
            }}
            onClick={
              onRequestSeatingRandomize
            }
          >
            Re-randomize Seating
          </button>
        </section>

        <section className="dashboard-card instructions-card">
          <h2>When You Enter</h2>

          <div className="card-content">
            {lesson?.instructions || '—'}
          </div>
        </section>

        <section className="dashboard-card homework-card">
          <h2>Homework</h2>

          <div className="card-content">
            {lesson?.homework || 'None'}
          </div>
        </section>

        <section className="dashboard-card warmup-card">
          <h2>Warm-Up</h2>

          <div className="warmup-content">
            {lesson?.warmUp || '—'}
          </div>
        </section>
      </main>
    </div>
  )
}

export default DisplayMode