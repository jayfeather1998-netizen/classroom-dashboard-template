import {
  useEffect,
  useState,
} from 'react'

import type {
  ClassPeriod,
  PeriodType,
  ScheduleSettings,
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
  onChangeTeacherPin: (
    currentPin: string,
    newPin: string,
  ) => Promise<{
    success: boolean
    message: string
  }>
  onChangeSitePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{
    success: boolean
    message: string
  }>

  scheduleSettings: ScheduleSettings

  onChangeScheduleSettings: (
    settings: ScheduleSettings,
  ) => Promise<{
    success: boolean
    message: string
  }>

}

function TeacherSetup({
  subjects,
  periods,
  newSubjectName,
  onNewSubjectNameChange,
  onAddSubject,
  onDeleteSubject,
  onUpdatePeriod,
  onChangeTeacherPin,
  onChangeSitePassword,
  scheduleSettings,
  onChangeScheduleSettings,
  }: TeacherSetupProps) {
  const [currentPin, setCurrentPin] =
    useState('')

  const [newPin, setNewPin] =
    useState('')

  const [confirmPin, setConfirmPin] =
    useState('')

  const [pinMessage, setPinMessage] =
    useState('')

  const [changingPin, setChangingPin] =
    useState(false)

  const [
    currentSitePassword,
    setCurrentSitePassword,
  ] = useState('')

  const [
    newSitePassword,
    setNewSitePassword,
  ] = useState('')

  const [
    confirmSitePassword,
    setConfirmSitePassword,
  ] = useState('')

  const [
    sitePasswordMessage,
    setSitePasswordMessage,
  ] = useState('')

  const [
    changingSitePassword,
    setChangingSitePassword,
  ] = useState(false)

  const [
    scheduleDraft,
    setScheduleDraft,
  ] = useState<ScheduleSettings>(
    scheduleSettings,
  )

  useEffect(() => {
    setScheduleDraft(
      scheduleSettings,
    )
  }, [scheduleSettings])

  const [
    scheduleMessage,
    setScheduleMessage,
  ] = useState('')

  const [
    savingSchedule,
    setSavingSchedule,
  ] = useState(false)

  async function handleChangePin() {
    setPinMessage('')

    if (!/^\d{4}$/.test(newPin)) {
      setPinMessage(
        'The new PIN must contain exactly 4 digits.',
      )
      return
    }

    if (newPin !== confirmPin) {
      setPinMessage(
        'The new PIN entries do not match.',
      )
      return
    }

    setChangingPin(true)

    try {
      const result =
        await onChangeTeacherPin(
          currentPin,
          newPin,
        )

      setPinMessage(result.message)

      if (result.success) {
        setCurrentPin('')
        setNewPin('')
        setConfirmPin('')
      }
    } finally {
      setChangingPin(false)
    }
  }

  async function handleChangeSitePassword() {
    setSitePasswordMessage('')

    if (newSitePassword.length < 6) {
      setSitePasswordMessage(
        'The new site password must contain at least 6 characters.',
      )
      return
    }

    if (
      newSitePassword !==
      confirmSitePassword
    ) {
      setSitePasswordMessage(
        'The new password entries do not match.',
      )
      return
    }

    setChangingSitePassword(true)

    try {
      const result =
        await onChangeSitePassword(
          currentSitePassword,
          newSitePassword,
        )

      setSitePasswordMessage(
        result.message,
      )

      if (result.success) {
        setCurrentSitePassword('')
        setNewSitePassword('')
        setConfirmSitePassword('')
      }
    } finally {
      setChangingSitePassword(false)
    }
  }

  async function handleSaveSchedule() {
    setScheduleMessage('')
    setSavingSchedule(true)

    try {
      const result =
        await onChangeScheduleSettings(
          scheduleDraft,
        )

      setScheduleMessage(
        result.message,
      )
    } finally {
      setSavingSchedule(false)
    }
  }

  const sortedPeriods = [...periods].sort(
    (periodA, periodB) =>
      periodA.number - periodB.number,
  )

  const displayedPeriods =
    scheduleSettings.mode === 'standard'
      ? sortedPeriods.slice(
          0,
          scheduleSettings.standardPeriodCount,
        )
      : sortedPeriods.slice(
          0,
          scheduleSettings.aDayPeriodCount +
            scheduleSettings.bDayPeriodCount,
        )

  function getDisplayedBlockDay(
    periodIndex: number,
  ) {
    return periodIndex <
      scheduleSettings.aDayPeriodCount
      ? 'A'
      : 'B'
  }

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
              onNewSubjectNameChange(
                event.target.value,
              )
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
                  onDeleteSubject(
                    subject.id,
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="teacher-section">
        <h2>Schedule</h2>

        <p className="section-note">
          Choose how class periods are organized
          during the school day.
        </p>

        <div className="teacher-pin-form">
          <label>
            Schedule Type

            <select
              value={scheduleDraft.mode}
              onChange={(event) => {
                setScheduleDraft({
                  ...scheduleDraft,
                  mode:
                    event.target.value ===
                    'standard'
                      ? 'standard'
                      : 'block',
                })

                setScheduleMessage('')
              }}
            >
              <option value="block">
                Block Schedule
              </option>

              <option value="standard">
                Standard Schedule
              </option>
            </select>
          </label>

          {scheduleDraft.mode ===
          'standard' ? (
            <label>
              Periods Per Day

              <input
                type="number"
                min="1"
                max="13"
                value={
                  scheduleDraft.standardPeriodCount
                }
                onChange={(event) => {
                  setScheduleDraft({
                    ...scheduleDraft,
                    standardPeriodCount:
                      Math.max(
                        1,
                        Number(
                          event.target.value,
                        ) || 1,
                      ),
                  })

                  setScheduleMessage('')
                }}
              />
            </label>
          ) : (
            <>
              <label>
                A Day Periods

                <input
                  type="number"
                  min="1"
                  max="6"
                  value={
                    scheduleDraft.aDayPeriodCount
                  }
                  onChange={(event) => {
                    setScheduleDraft({
                      ...scheduleDraft,
                      aDayPeriodCount:
                        Math.max(
                          1,
                          Number(
                            event.target.value,
                          ) || 1,
                        ),
                    })

                    setScheduleMessage('')
                  }}
                />
              </label>

              <label>
                B Day Periods

                <input
                  type="number"
                  min="1"
                  max="6"
                  value={
                    scheduleDraft.bDayPeriodCount
                  }
                  onChange={(event) => {
                    setScheduleDraft({
                      ...scheduleDraft,
                      bDayPeriodCount:
                        Math.max(
                          1,
                          Number(
                            event.target.value,
                          ) || 1,
                        ),
                    })

                    setScheduleMessage('')
                  }}
                />
              </label>
            </>
          )}

          <button
            type="button"
            disabled={savingSchedule}
            onClick={handleSaveSchedule}
          >
            {savingSchedule
              ? 'Saving...'
              : 'Save Schedule Settings'}
          </button>

          {scheduleMessage && (
            <p className="teacher-pin-message">
              {scheduleMessage}
            </p>
          )}
        </div>
      </section>

      <section className="teacher-section">
        <h2>Class Periods</h2>

        <p className="section-note">
          {scheduleSettings.mode ===
          'standard'
            ? `Periods 0–${scheduleSettings.standardPeriodCount} are available. Mark any unused periods as Prep.`
            : 'Configure the class and prep periods used on A Days and B Days.'}
        </p>

        <div className="period-settings">
          {displayedPeriods.map(
            (period, periodIndex) => (
            <div
              className="period-setting"
              key={period.id}
              style={{
                borderLeftColor:
                  period.accent,
              }}
            >
              <div className="period-setting-title">
                <span
                  className="period-color-dot"
                  style={{
                    backgroundColor:
                      period.accent,
                  }}
                />

                <strong>
                  Period {period.number}
                </strong>

                {scheduleSettings.mode ===
                  'block' && (
                  <span>
                    {getDisplayedBlockDay(
                      periodIndex,
                    )}{' '}
                    Day
                  </span>
                )}

                <span>
                  {period.colorName}
                </span>
              </div>

              <label>
                Type

                <select
                  value={period.type}
                  onChange={(event) =>
                    onUpdatePeriod(
                      period.id,
                      {
                        type:
                          event.target
                            .value as PeriodType,
                      },
                    )
                  }
                >
                  <option value="class">
                    Class
                  </option>

                  <option value="prep">
                    Prep
                  </option>
                </select>
              </label>

              <label>
                Subject

                <select
                  value={
                    period.subjectId ??
                    ''
                  }
                  disabled={
                    period.type ===
                    'prep'
                  }
                  onChange={(event) =>
                    onUpdatePeriod(
                      period.id,
                      {
                        subjectId:
                          event.target
                            .value ||
                          null,
                      },
                    )
                  }
                >
                  <option value="">
                    No subject
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        key={
                          subject.id
                        }
                        value={
                          subject.id
                        }
                      >
                        {
                          subject.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="teacher-section">
        <h2>Teacher PIN</h2>

        <p className="section-note">
          The default Teacher PIN is 1234. Change it here
          after setting up your dashboard.
        </p>

        <div className="teacher-pin-form">
          <label>
            Current PIN

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(event) =>
                setCurrentPin(
                  event.target.value.replace(
                    /\D/g,
                    '',
                  ),
                )
              }
            />
          </label>

          <label>
            New PIN

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(event) =>
                setNewPin(
                  event.target.value.replace(
                    /\D/g,
                    '',
                  ),
                )
              }
            />
          </label>

          <label>
            Confirm New PIN

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(event) =>
                setConfirmPin(
                  event.target.value.replace(
                    /\D/g,
                    '',
                  ),
                )
              }
            />
          </label>

          <button
            type="button"
            disabled={changingPin}
            onClick={handleChangePin}
          >
            {changingPin
              ? 'Changing PIN...'
              : 'Change Teacher PIN'}
          </button>

          {pinMessage && (
            <p className="teacher-pin-message">
              {pinMessage}
            </p>
          )}
        </div>
      </section>
      <section className="teacher-section">
        <h2>Site Password</h2>

        <p className="section-note">
          The default site password is classroom. This password
          protects access to the entire dashboard. Change it after
          setting up your copy.
        </p>

        <div className="teacher-pin-form">
          <label>
            Current Site Password

            <input
              type="password"
              autoComplete="current-password"
              value={currentSitePassword}
              onChange={(event) =>
                setCurrentSitePassword(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            New Site Password

            <input
              type="password"
              autoComplete="new-password"
              value={newSitePassword}
              onChange={(event) =>
                setNewSitePassword(
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            Confirm New Site Password

            <input
              type="password"
              autoComplete="new-password"
              value={confirmSitePassword}
              onChange={(event) =>
                setConfirmSitePassword(
                  event.target.value,
                )
              }
            />
          </label>

          <button
            type="button"
            disabled={changingSitePassword}
            onClick={
              handleChangeSitePassword
            }
          >
            {changingSitePassword
              ? 'Changing Password...'
              : 'Change Site Password'}
          </button>

          {sitePasswordMessage && (
            <p className="teacher-pin-message">
              {sitePasswordMessage}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default TeacherSetup