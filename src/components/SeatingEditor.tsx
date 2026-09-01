import type {
  ClassPeriod,
  ForbiddenPair,
  SeatingChart,
  SeatingLayoutMode,
  Student,
} from '../types/classroom'

import {
  calculateSeatingLayout,
  createSeatingGroups,
} from '../data/seating'

import {
  useEffect,
  useState,
} from 'react'

type SeatingEditorProps = {
  periods: ClassPeriod[]
  students: Student[]
  seatingCharts: SeatingChart[]
  forbiddenPairs: ForbiddenPair[]
  selectedPeriodId: string

  onSelectPeriod: (
    periodId: string,
  ) => void

  onAddStudent: (
    periodId: string,
    firstName: string,
    lastInitial: string,
  ) => Promise<void>

  onDeleteStudent: (
    studentId: string,
  ) => void

  onToggleBlockedSeat: (
    periodId: string,
    seatId: string,
  ) => void

  onRandomizeSeating: (
    periodId: string,
  ) => void

  onUpdateSeatingLayout: (
    periodId: string,
    layoutMode: SeatingLayoutMode,
    groupCount: number,
    groupSize: number,
  ) => Promise<void>

  onAddForbiddenPair: (
    periodId: string,
    studentId1: string,
    studentId2: string,
  ) => void

  onDeleteForbiddenPair: (
    pairId: string,
  ) => void

  onSwapSeats: (
    periodId: string,
    firstSeatId: string,
    secondSeatId: string,
  ) => Promise<boolean>
}

function SeatingEditor({
  periods,
  students,
  seatingCharts,
  forbiddenPairs,
  selectedPeriodId,
  onSelectPeriod,
  onAddStudent,
  onDeleteStudent,
  onToggleBlockedSeat,
  onRandomizeSeating,
  onUpdateSeatingLayout,
  onAddForbiddenPair,
  onDeleteForbiddenPair,
  onSwapSeats,
}: SeatingEditorProps) {
  const [
    selectedSeatId,
    setSelectedSeatId,
  ] = useState<string | null>(null)

  const [
    showRosterImport,
    setShowRosterImport,
  ] = useState(false)

  const [
    rosterImportText,
    setRosterImportText,
  ] = useState('')

  const [
    rosterImportPreview,
    setRosterImportPreview,
  ] = useState<
    Array<{
      firstName: string
      lastInitial: string
      sourceLine: string
      duplicate: boolean
    }>
  >([])

  const [
    rosterImportErrors,
    setRosterImportErrors,
  ] = useState<string[]>([])

  const [
    rosterImporting,
    setRosterImporting,
  ] = useState(false)

  const [
    layoutMode,
    setLayoutMode,
  ] =
    useState<SeatingLayoutMode>(
      'groupCount',
    )

  const [
    requestedGroupCount,
    setRequestedGroupCount,
  ] = useState(9)

  const [
    requestedGroupSize,
    setRequestedGroupSize,
  ] = useState(4)

  const [
    savingLayout,
    setSavingLayout,
  ] = useState(false)

  const classPeriods =
    periods.filter(
      (period) =>
        period.type === 'class',
    )

  const currentStudents =
    students.filter(
      (student) =>
        student.periodId ===
        selectedPeriodId,
    )

  const currentChart =
    seatingCharts.find(
      (chart) =>
        chart.periodId ===
        selectedPeriodId,
    )

  const currentForbiddenPairs =
    forbiddenPairs.filter(
      (pair) =>
        pair.periodId ===
        selectedPeriodId,
    )

  // Whenever the teacher changes periods,
  // load that period's saved layout settings.
  useEffect(() => {
    setLayoutMode(
      currentChart?.layoutMode ??
        'groupCount',
    )

    setRequestedGroupCount(
      currentChart?.groupCount ?? 9,
    )

    setRequestedGroupSize(
      currentChart?.groupSize ?? 4,
    )

    setSelectedSeatId(null)
  }, [
    selectedPeriodId,
    currentChart?.layoutMode,
    currentChart?.groupCount,
    currentChart?.groupSize,
  ])

  const previewLayout =
    calculateSeatingLayout(
      currentStudents.length,
      layoutMode,
      requestedGroupCount,
      requestedGroupSize,
    )

  const displayGroupCount =
    currentChart?.groupCount ??
    previewLayout.groupCount

  const displayGroupSize =
    currentChart?.groupSize ??
    previewLayout.groupSize

  const seatingGroups =
    createSeatingGroups(
      displayGroupCount,
    )

  function handleAddStudent(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const formData =
      new FormData(
        event.currentTarget,
      )

    const firstName =
      String(
        formData.get(
          'firstName',
        ) ?? '',
      ).trim()

    const lastInitial =
      String(
        formData.get(
          'lastInitial',
        ) ?? '',
      )
        .trim()
        .slice(0, 1)

    if (
      !firstName ||
      !lastInitial
    ) {
      return
    }

    onAddStudent(
      selectedPeriodId,
      firstName,
      lastInitial,
    )

    event.currentTarget.reset()
  }

  function previewRosterImport() {
    setRosterImportPreview([])
    setRosterImportErrors([])

    const lines =
      rosterImportText
        .split(/\r?\n/)
        .map(
          (line) =>
            line.trim(),
        )
        .filter(Boolean)

    if (
      lines.length === 0
    ) {
      setRosterImportErrors([
        'Paste at least one student in Last, First format.',
      ])

      return
    }

    const preview: Array<{
      firstName: string
      lastInitial: string
      sourceLine: string
      duplicate: boolean
    }> = []

    const errors: string[] = []

    const seenNames =
      new Set<string>()

    for (
      let index = 0;
      index < lines.length;
      index++
    ) {
      const line =
        lines[index]

      const commaIndex =
        line.indexOf(',')

      if (
        commaIndex <= 0 ||
        commaIndex ===
          line.length - 1
      ) {
        errors.push(
          `Line ${index + 1}: "${line}" is not in Last, First format.`,
        )

        continue
      }

      const lastName =
        line
          .slice(
            0,
            commaIndex,
          )
          .trim()

      const firstName =
        line
          .slice(
            commaIndex + 1,
          )
          .trim()

      if (
        !lastName ||
        !firstName
      ) {
        errors.push(
          `Line ${index + 1}: "${line}" is missing a first or last name.`,
        )

        continue
      }

      const lastInitial =
        lastName
          .charAt(0)
          .toUpperCase()

      const nameKey =
        `${firstName.toLowerCase()}|${lastInitial.toLowerCase()}`

      const alreadyOnRoster =
        currentStudents.some(
          (student) =>
            student.firstName
              .trim()
              .toLowerCase() ===
              firstName.toLowerCase() &&
            student.lastInitial
              .trim()
              .toLowerCase() ===
              lastInitial.toLowerCase(),
        )

      const duplicate =
        alreadyOnRoster ||
        seenNames.has(
          nameKey,
        )

      preview.push({
        firstName,
        lastInitial,
        sourceLine: line,
        duplicate,
      })

      seenNames.add(
        nameKey,
      )
    }

    setRosterImportPreview(
      preview,
    )

    setRosterImportErrors(
      errors,
    )
  }

  async function confirmRosterImport() {
    const studentsToImport =
      rosterImportPreview.filter(
        (student) =>
          !student.duplicate,
      )

    if (
      studentsToImport.length ===
      0
    ) {
      return
    }

    if (
      rosterImportErrors.length >
      0
    ) {
      window.alert(
        'Fix the flagged roster lines before importing.',
      )

      return
    }

    setRosterImporting(true)

    try {
      for (
        const student of
        studentsToImport
      ) {
        await onAddStudent(
          selectedPeriodId,
          student.firstName,
          student.lastInitial,
        )
      }

      setRosterImportText('')
      setRosterImportPreview([])
      setRosterImportErrors([])
      setShowRosterImport(false)
    } finally {
      setRosterImporting(false)
    }
  }

  function handleAddForbiddenPair(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const formData =
      new FormData(
        event.currentTarget,
      )

    const studentId1 =
      String(
        formData.get(
          'studentId1',
        ) ?? '',
      )

    const studentId2 =
      String(
        formData.get(
          'studentId2',
        ) ?? '',
      )

    if (
      !studentId1 ||
      !studentId2 ||
      studentId1 ===
        studentId2
    ) {
      return
    }

    onAddForbiddenPair(
      selectedPeriodId,
      studentId1,
      studentId2,
    )

    event.currentTarget.reset()
  }

  async function handleSeatClick(
    seatId: string,
    studentId:
      | string
      | null
      | undefined,
  ) {
    if (!selectedSeatId) {
      if (!studentId) return

      setSelectedSeatId(
        seatId,
      )

      return
    }

    if (
      selectedSeatId ===
      seatId
    ) {
      setSelectedSeatId(null)

      return
    }

    const success =
      await onSwapSeats(
        selectedPeriodId,
        selectedSeatId,
        seatId,
      )

    if (success) {
      setSelectedSeatId(null)
    }
  }

  async function handleApplyLayout() {
    const calculated =
      calculateSeatingLayout(
        currentStudents.length,
        layoutMode,
        requestedGroupCount,
        requestedGroupSize,
      )

    setSavingLayout(true)

    try {
      await onUpdateSeatingLayout(
        selectedPeriodId,
        layoutMode,
        calculated.groupCount,
        calculated.groupSize,
      )
    } finally {
      setSavingLayout(false)
    }
  }

  return (
    <main className="seating-editor">
      <section className="teacher-panel">
        <div className="seating-editor-header">
          <div>
            <h2>
              Seating Charts
            </h2>

            <p>
              Manage rosters,
              blocked seats, group
              layouts, and seating
              arrangements.
            </p>
          </div>

          <label>
            Class Period

            <select
              value={
                selectedPeriodId
              }
              onChange={(
                event,
              ) =>
                onSelectPeriod(
                  event.target
                    .value,
                )
              }
            >
              {classPeriods.map(
                (period) => (
                  <option
                    key={
                      period.id
                    }
                    value={
                      period.id
                    }
                  >
                    Period{' '}
                    {
                      period.number
                    }
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
      </section>

      <div className="seating-editor-layout">
        {/* LEFT COLUMN */}
        <div className="seating-sidebar">

          {/* ROSTER */}
          <section className="teacher-panel roster-panel">
            <h3>Roster</h3>

            <p>
              {
                currentStudents.length
              }{' '}
              students
            </p>

            <form
              className="student-add-form"
              onSubmit={
                handleAddStudent
              }
            >
              <input
                name="firstName"
                placeholder="First name"
              />

              <input
                name="lastInitial"
                placeholder="Last initial"
                maxLength={1}
              />

              <button
                type="submit"
              >
                Add
              </button>
            </form>

            <button
              type="button"
              className="roster-import-toggle"
              onClick={() => {
                setShowRosterImport(
                  !showRosterImport,
                )

                setRosterImportText(
                  '',
                )

                setRosterImportPreview(
                  [],
                )

                setRosterImportErrors(
                  [],
                )
              }}
            >
              {showRosterImport
                ? 'Cancel Roster Import'
                : 'Import Class List'}
            </button>

            {showRosterImport && (
              <div className="roster-import-panel">
                <p>
                  Paste one student
                  per line in
                  <strong>
                    {' '}
                    Last, First
                  </strong>{' '}
                  format. Only the
                  first name and last
                  initial will be
                  saved.
                </p>

                <textarea
                  value={
                    rosterImportText
                  }
                  onChange={(
                    event,
                  ) => {
                    setRosterImportText(
                      event.target
                        .value,
                    )

                    setRosterImportPreview(
                      [],
                    )

                    setRosterImportErrors(
                      [],
                    )
                  }}
                  placeholder={
                    'Campbell, Savannah\nSmith, Jordan\nGarcia, Maria'
                  }
                  rows={8}
                  disabled={
                    rosterImporting
                  }
                />

                <div className="roster-import-actions">
                  <button
                    type="button"
                    onClick={
                      previewRosterImport
                    }
                    disabled={
                      !rosterImportText.trim() ||
                      rosterImporting
                    }
                  >
                    Preview
                  </button>
                </div>

                {rosterImportErrors.length >
                  0 && (
                  <div className="roster-import-errors">
                    {rosterImportErrors.map(
                      (error) => (
                        <p
                          key={
                            error
                          }
                        >
                          {error}
                        </p>
                      ),
                    )}
                  </div>
                )}

                {rosterImportPreview.length >
                  0 && (
                  <div className="roster-import-preview">
                    <h4>
                      Import Preview
                    </h4>

                    {rosterImportPreview.map(
                      (
                        student,
                        index,
                      ) => (
                        <div
                          key={`${student.sourceLine}-${index}`}
                          className={[
                            'roster-import-preview-row',
                            student.duplicate
                              ? 'duplicate'
                              : '',
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(
                              ' ',
                            )}
                        >
                          <span>
                            {
                              student.firstName
                            }{' '}
                            {
                              student.lastInitial
                            }
                            .
                          </span>

                          {student.duplicate && (
                            <span>
                              Possible
                              duplicate
                              — skipped
                            </span>
                          )}
                        </div>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={
                        confirmRosterImport
                      }
                      disabled={
                        rosterImporting ||
                        rosterImportErrors.length >
                          0 ||
                        rosterImportPreview.every(
                          (
                            student,
                          ) =>
                            student.duplicate,
                        )
                      }
                    >
                      {rosterImporting
                        ? 'Importing...'
                        : `Import ${
                            rosterImportPreview.filter(
                              (
                                student,
                              ) =>
                                !student.duplicate,
                            )
                              .length
                          } Students`}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="student-roster-list">
              {currentStudents.map(
                (student) => (
                  <div
                    key={
                      student.id
                    }
                    className="student-roster-row"
                  >
                    <span>
                      {
                        student.firstName
                      }{' '}
                      {
                        student.lastInitial
                      }
                      .
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        onDeleteStudent(
                          student.id,
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ),
              )}
            </div>
          </section>

          {/* FORBIDDEN PAIRS */}
          <section className="teacher-panel forbidden-pairs-panel">
            <h3>
              Forbidden Pairs
            </h3>

            <p>
              Students listed here
              cannot be placed in the
              same group.
            </p>

            <form
              className="forbidden-pair-form"
              onSubmit={
                handleAddForbiddenPair
              }
            >
              <select
                name="studentId1"
                defaultValue=""
                disabled={
                  currentStudents.length <
                  2
                }
              >
                <option
                  value=""
                  disabled
                >
                  Student 1
                </option>

                {currentStudents.map(
                  (student) => (
                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >
                      {
                        student.firstName
                      }{' '}
                      {
                        student.lastInitial
                      }
                      .
                    </option>
                  ),
                )}
              </select>

              <select
                name="studentId2"
                defaultValue=""
                disabled={
                  currentStudents.length <
                  2
                }
              >
                <option
                  value=""
                  disabled
                >
                  Student 2
                </option>

                {currentStudents.map(
                  (student) => (
                    <option
                      key={
                        student.id
                      }
                      value={
                        student.id
                      }
                    >
                      {
                        student.firstName
                      }{' '}
                      {
                        student.lastInitial
                      }
                      .
                    </option>
                  ),
                )}
              </select>

              <button
                type="submit"
                disabled={
                  currentStudents.length <
                  2
                }
              >
                Add Pair
              </button>
            </form>

            <div className="forbidden-pair-list">
              {currentForbiddenPairs.length ===
                0 && (
                <p className="empty-pair-message">
                  No forbidden pairs
                  yet.
                </p>
              )}

              {currentForbiddenPairs.map(
                (pair) => {
                  const student1 =
                    currentStudents.find(
                      (
                        student,
                      ) =>
                        student.id ===
                        pair.studentId1,
                    )

                  const student2 =
                    currentStudents.find(
                      (
                        student,
                      ) =>
                        student.id ===
                        pair.studentId2,
                    )

                  if (
                    !student1 ||
                    !student2
                  ) {
                    return null
                  }

                  return (
                    <div
                      key={
                        pair.id
                      }
                      className="forbidden-pair-row"
                    >
                      <span>
                        {
                          student1.firstName
                        }{' '}
                        {
                          student1.lastInitial
                        }
                        .
                        {' + '}
                        {
                          student2.firstName
                        }{' '}
                        {
                          student2.lastInitial
                        }
                        .
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onDeleteForbiddenPair(
                            pair.id,
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                },
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <section className="teacher-panel seating-grid-panel">

          {/* LAYOUT CONTROLS */}
          <div className="seating-layout-controls">
            <div>
              <h3>
                Group Layout
              </h3>

              <p>
                Choose how you want
                the classroom divided.
              </p>
            </div>

            <div className="seating-layout-mode">
              <label>
                <input
                  type="radio"
                  name="layoutMode"
                  checked={
                    layoutMode ===
                    'groupCount'
                  }
                  onChange={() =>
                    setLayoutMode(
                      'groupCount',
                    )
                  }
                />

                Number of groups
              </label>

              <label>
                <input
                  type="radio"
                  name="layoutMode"
                  checked={
                    layoutMode ===
                    'groupSize'
                  }
                  onChange={() =>
                    setLayoutMode(
                      'groupSize',
                    )
                  }
                />

                Students per group
              </label>
            </div>

            {layoutMode ===
            'groupCount' ? (
              <label>
                Number of groups

                <input
                  type="number"
                  min={1}
                  step={1}
                  value={
                    requestedGroupCount
                  }
                  onChange={(
                    event,
                  ) =>
                    setRequestedGroupCount(
                      Math.max(
                        1,
                        Number(
                          event
                            .target
                            .value,
                        ) || 1,
                      ),
                    )
                  }
                />
              </label>
            ) : (
              <label>
                Students per group

                <input
                  type="number"
                  min={1}
                  step={1}
                  value={
                    requestedGroupSize
                  }
                  onChange={(
                    event,
                  ) =>
                    setRequestedGroupSize(
                      Math.max(
                        1,
                        Number(
                          event
                            .target
                            .value,
                        ) || 1,
                      ),
                    )
                  }
                />
              </label>
            )}

            <div className="seating-layout-summary">
              {
                currentStudents.length
              }{' '}
              students →{' '}
              {
                previewLayout.groupCount
              }{' '}
              groups ×{' '}
              {
                previewLayout.groupSize
              }{' '}
              seats ={' '}
              {previewLayout.groupCount *
                previewLayout.groupSize}{' '}
              seats
            </div>

            <button
              type="button"
              onClick={
                handleApplyLayout
              }
              disabled={
                savingLayout
              }
            >
              {savingLayout
                ? 'Applying...'
                : 'Apply Layout'}
            </button>
          </div>

          <div className="seating-actions">
            <button
              type="button"
              onClick={() =>
                onRandomizeSeating(
                  selectedPeriodId,
                )
              }
              disabled={
                currentStudents.length ===
                0
              }
            >
              Randomize Seating
            </button>
          </div>

          <div className="seating-grid">
            {seatingGroups.map(
              (group) => (
                <div
                  key={
                    group.groupNumber
                  }
                  className="seating-group"
                  style={{
                    borderColor:
                      group.color,
                    backgroundColor:
                      group.light,
                  }}
                >
                  <div
                    className="seating-group-title"
                    style={{
                      backgroundColor:
                        group.color,
                    }}
                  >
                    Group{' '}
                    {
                      group.groupNumber
                    }
                  </div>

                  <div className="group-seat-grid">
                    {Array.from(
                      {
                        length:
                          displayGroupSize,
                      },
                      (
                        _,
                        index,
                      ) => {
                        const position =
                          index + 1

                        const seatId =
                          `g${group.groupNumber}-s${position}`

                        const blocked =
                          currentChart?.blockedSeatIds.includes(
                            seatId,
                          ) ??
                          false

                        const studentId =
                          currentChart
                            ?.assignments[
                            seatId
                          ]

                        const assignedStudent =
                          currentStudents.find(
                            (
                              student,
                            ) =>
                              student.id ===
                              studentId,
                          )

                        return (
                          <div
                            key={
                              seatId
                            }
                            className="seat-cell"
                          >
                            <button
                              type="button"
                              className={[
                                'seat-button',
                                blocked
                                  ? 'blocked-seat'
                                  : '',
                                selectedSeatId ===
                                seatId
                                  ? 'selected-seat'
                                  : '',
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(
                                  ' ',
                                )}
                              disabled={
                                blocked
                              }
                              onClick={() =>
                                handleSeatClick(
                                  seatId,
                                  studentId ??
                                    null,
                                )
                              }
                            >
                              {blocked
                                ? 'Blocked'
                                : assignedStudent
                                  ? `${assignedStudent.firstName} ${assignedStudent.lastInitial}.`
                                  : 'Empty'}
                            </button>

                            <button
                              type="button"
                              className="seat-block-button"
                              onClick={() => {
                                if (
                                  selectedSeatId ===
                                  seatId
                                ) {
                                  setSelectedSeatId(
                                    null,
                                  )
                                }

                                onToggleBlockedSeat(
                                  selectedPeriodId,
                                  seatId,
                                )
                              }}
                            >
                              {blocked
                                ? 'Unblock'
                                : 'Block'}
                            </button>
                          </div>
                        )
                      },
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default SeatingEditor