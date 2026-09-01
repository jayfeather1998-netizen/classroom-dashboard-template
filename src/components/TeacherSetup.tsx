import type {
  ClassPeriod,
  PeriodType,
  Subject,
} from '../types/classroom'

type TeacherSetupProps = {
  subjects: Subject[]
  periods: ClassPeriod[]
  newSubjectName: string
  onNewSubjectNameChange: (value: string) => void
  onAddSubject: () => void
  onDeleteSubject: (subjectId: string) => void
  onUpdatePeriod: (
    periodId: string,
    changes: Partial<ClassPeriod>,
  ) => void
}

function TeacherSetup({
  subjects,
  periods,
  newSubjectName,
  onNewSubjectNameChange,
  onAddSubject,
  onDeleteSubject,
  onUpdatePeriod,
}: TeacherSetupProps) {
  return (
    <main className="teacher-content">
      <section className="teacher-section">
        <h2>Subjects</h2>

        <div className="input-row">
          <input
            type="text"
            placeholder="Subject name"
            value={newSubjectName}
            onChange={(event) =>
              onNewSubjectNameChange(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onAddSubject()
              }
            }}
          />

          <button onClick={onAddSubject}>
            Add Subject
          </button>
        </div>

        <div className="subject-list">
          {subjects.map((subject) => (
            <div
              className="subject-chip"
              key={subject.id}
            >
              <span>{subject.name}</span>

              <button
                type="button"
                aria-label={`Delete ${subject.name}`}
                onClick={() =>
                  onDeleteSubject(subject.id)
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="teacher-section">
        <h2>Class Periods</h2>

        <p className="section-note">
          Periods 0 and 5 are advisory and are intentionally
          not included.
        </p>

        <div className="period-settings">
          {periods.map((period) => (
            <div
              className="period-setting"
              key={period.id}
              style={{
                borderLeftColor: period.accent,
              }}
            >
              <div className="period-setting-title">
                <span
                  className="period-color-dot"
                  style={{
                    backgroundColor: period.accent,
                  }}
                />

                <strong>
                  Period {period.number}
                </strong>

                <span>{period.day} Day</span>
                <span>{period.colorName}</span>
              </div>

              <label>
                Type

                <select
                  value={period.type}
                  onChange={(event) =>
                    onUpdatePeriod(period.id, {
                      type: event.target.value as PeriodType,
                    })
                  }
                >
                  <option value="class">Class</option>
                  <option value="prep">Prep</option>
                </select>
              </label>

              <label>
                Subject

                <select
                  value={period.subjectId ?? ''}
                  disabled={period.type === 'prep'}
                  onChange={(event) =>
                    onUpdatePeriod(period.id, {
                      subjectId:
                        event.target.value || null,
                    })
                  }
                >
                  <option value="">
                    No subject
                  </option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default TeacherSetup