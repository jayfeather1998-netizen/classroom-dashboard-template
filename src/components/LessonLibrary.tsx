import { useMemo, useState } from 'react'
import type { Lesson, Subject } from '../types/classroom'
import LessonImportModal from './LessonImportModal'

type LessonLibraryProps = {
  subjects: Subject[]
  lessons: Lesson[]
  selectedLessonId: string | null
  lessonSubjectFilter: string

  showLessonImport: boolean
  lessonImportText: string
  lessonImportPreview: Lesson[]
  lessonImportError: string

  onCreateLesson: () => void
  onSelectLesson: (lessonId: string | null) => void
  onSubjectFilterChange: (subjectId: string) => void
  onUpdateLesson: (
    lessonId: string,
    changes: Partial<Lesson>,
  ) => void
  onDeleteLesson: (lessonId: string) => void

  onOpenImport: () => void
  onCloseImport: () => void
  onImportTextChange: (value: string) => void
  onPreviewImport: () => void
  onConfirmImport: () => void
}

type SortMode = 'code' | 'name' | 'unit'

function LessonLibrary({
  subjects,
  lessons,
  selectedLessonId,
  lessonSubjectFilter,

  showLessonImport,
  lessonImportText,
  lessonImportPreview,
  lessonImportError,

  onCreateLesson,
  onSelectLesson,
  onSubjectFilterChange,
  onUpdateLesson,
  onDeleteLesson,

  onOpenImport,
  onCloseImport,
  onImportTextChange,
  onPreviewImport,
  onConfirmImport,
}: LessonLibraryProps) {
  const [unitFilter, setUnitFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] =
    useState<SortMode>('code')
  const [collapsedUnits, setCollapsedUnits] =
    useState<Set<string>>(new Set())

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const savedWidth = localStorage.getItem(
      'lesson-library-sidebar-width',
    )

    return savedWidth
      ? Number(savedWidth)
      : 400
  })

  const selectedLesson = lessons.find(
    (lesson) => lesson.id === selectedLessonId,
  )

  const availableUnits = useMemo(() => {
    const relevantLessons =
      lessonSubjectFilter === 'all'
        ? lessons
        : lessons.filter(
            (lesson) =>
              lesson.subjectId === lessonSubjectFilter,
          )

    return Array.from(
      new Set(
        relevantLessons
          .map((lesson) => lesson.unit?.trim() ?? '')
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    )
  }, [lessons, lessonSubjectFilter])

  const visibleLessons = useMemo(() => {
    const normalizedSearch =
      searchQuery.trim().toLowerCase()

    const filtered = lessons.filter((lesson) => {
      const matchesSubject =
        lessonSubjectFilter === 'all' ||
        lesson.subjectId === lessonSubjectFilter

      const matchesUnit =
        unitFilter === 'all' ||
        lesson.unit === unitFilter

      const subjectName =
        subjects.find(
          (subject) =>
            subject.id === lesson.subjectId,
        )?.name ?? ''

      const searchableText = [
        lesson.code,
        lesson.name,
        lesson.unit,
        lesson.learningTarget,
        lesson.instructions,
        lesson.homework,
        lesson.warmUp,
        subjectName,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch)

      return (
        matchesSubject &&
        matchesUnit &&
        matchesSearch
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortMode === 'name') {
        return a.name.localeCompare(
          b.name,
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          },
        )
      }

      if (sortMode === 'unit') {
        const unitCompare = (
          a.unit ?? ''
        ).localeCompare(
          b.unit ?? '',
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          },
        )

        if (unitCompare !== 0) {
          return unitCompare
        }
      }

      const codeCompare = (
        a.code ?? ''
      ).localeCompare(
        b.code ?? '',
        undefined,
        {
          numeric: true,
          sensitivity: 'base',
        },
      )

      if (codeCompare !== 0) {
        return codeCompare
      }

      return a.name.localeCompare(
        b.name,
        undefined,
        {
          numeric: true,
          sensitivity: 'base',
        },
      )
    })
  }, [
    lessons,
    lessonSubjectFilter,
    unitFilter,
    searchQuery,
    sortMode,
    subjects,
  ])

  const groupedLessons = useMemo(() => {
    const groups = new Map<string, Lesson[]>()

    for (const lesson of visibleLessons) {
      const unit =
        lesson.unit?.trim() || 'No Unit'

      const existing = groups.get(unit)

      if (existing) {
        existing.push(lesson)
      } else {
        groups.set(unit, [lesson])
      }
    }

    return Array.from(groups.entries()).sort(
      ([unitA], [unitB]) =>
        unitA.localeCompare(
          unitB,
          undefined,
          {
            numeric: true,
            sensitivity: 'base',
          },
        ),
    )
  }, [visibleLessons])

  function startSidebarResize(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    event.preventDefault()

    const startingX = event.clientX
    const startingWidth = sidebarWidth

    function handleMouseMove(
      moveEvent: MouseEvent,
    ) {
      const difference =
        moveEvent.clientX - startingX

      const newWidth = Math.min(
        650,
        Math.max(
          300,
          startingWidth + difference,
        ),
      )

      setSidebarWidth(newWidth)

      localStorage.setItem(
        'lesson-library-sidebar-width',
        String(newWidth),
      )
    }

    function handleMouseUp() {
      document.removeEventListener(
        'mousemove',
        handleMouseMove,
      )

      document.removeEventListener(
        'mouseup',
        handleMouseUp,
      )
    }

    document.addEventListener(
      'mousemove',
      handleMouseMove,
    )

    document.addEventListener(
      'mouseup',
      handleMouseUp,
    )
  }
  function toggleUnit(unit: string) {
    setCollapsedUnits((current) => {
      const next = new Set(current)

      if (next.has(unit)) {
        next.delete(unit)
      } else {
        next.add(unit)
      }

      return next
    })
  }

  function expandAllUnits() {
    setCollapsedUnits(new Set())
  }

  function collapseAllUnits() {
    setCollapsedUnits(
      new Set(
        groupedLessons.map(
          ([unit]) => unit,
        ),
      ),
    )
  }

  return (
    <main className="lesson-library">
      {showLessonImport && (
        <LessonImportModal
          subjects={subjects}
          importText={lessonImportText}
          importPreview={lessonImportPreview}
          importError={lessonImportError}
          onImportTextChange={onImportTextChange}
          onPreviewImport={onPreviewImport}
          onConfirmImport={onConfirmImport}
          onClose={onCloseImport}
        />
      )}

      <aside
        className="lesson-sidebar"
        style={{
          width: `${sidebarWidth}px`,
          flex: `0 0 ${sidebarWidth}px`,
        }}
      >
        <div className="lesson-sidebar-header">
          <h2>Lesson Library</h2>

          <div className="lesson-library-actions">
            <button onClick={onCreateLesson}>
              + New Lesson
            </button>

            <button onClick={onOpenImport}>
              Import
            </button>
          </div>
        </div>

        <div className="lesson-filter-grid">
          <label className="subject-filter">
            Subject

            <select
              value={lessonSubjectFilter}
              onChange={(event) => {
                onSubjectFilterChange(
                  event.target.value,
                )
                setUnitFilter('all')
                onSelectLesson(null)
              }}
            >
              <option value="all">
                All Subjects
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

          <label className="subject-filter">
            Unit

            <select
              value={unitFilter}
              onChange={(event) => {
                setUnitFilter(
                  event.target.value,
                )
                onSelectLesson(null)
              }}
            >
              <option value="all">
                All Units
              </option>

              {availableUnits.map((unit) => (
                <option
                  key={unit}
                  value={unit}
                >
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="lesson-search">
          Search

          <input
            type="search"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
          />
        </label>

        <div className="lesson-library-toolbar">
          <label className="lesson-sort">
            Sort

            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(
                  event.target
                    .value as SortMode,
                )
              }
            >
              <option value="code">
                Lesson Code
              </option>

              <option value="name">
                Lesson Name
              </option>

              <option value="unit">
                Unit
              </option>
            </select>
          </label>

          <div className="lesson-collapse-actions">
            <button
              type="button"
              onClick={expandAllUnits}
            >
              Expand All
            </button>

            <button
              type="button"
              onClick={collapseAllUnits}
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="lesson-result-count">
          {visibleLessons.length}{' '}
          {visibleLessons.length === 1
            ? 'lesson'
            : 'lessons'}
        </div>

        <div className="lesson-list">
          {visibleLessons.length === 0 ? (
            <p className="empty-message">
              No lessons match these filters.
            </p>
          ) : (
            groupedLessons.map(
              ([unit, unitLessons]) => {
                const isCollapsed =
                  collapsedUnits.has(unit)

                return (
                  <section
                    className="lesson-unit-group"
                    key={unit}
                  >
                    <button
                      type="button"
                      className="lesson-unit-heading"
                      onClick={() =>
                        toggleUnit(unit)
                      }
                    >
                      <span
                        className="lesson-unit-arrow"
                        aria-hidden="true"
                      >
                        {isCollapsed
                          ? '▶'
                          : '▼'}
                      </span>

                      <span className="lesson-unit-name">
                        {unit}
                      </span>

                      <span className="lesson-unit-count">
                        {unitLessons.length}
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className="lesson-unit-lessons">
                        {unitLessons.map(
                          (lesson) => {
                            const subject =
                              subjects.find(
                                (item) =>
                                  item.id ===
                                  lesson.subjectId,
                              )

                            return (
                              <button
                                key={lesson.id}
                                className={
                                  lesson.id ===
                                  selectedLessonId
                                    ? 'lesson-list-item active'
                                    : 'lesson-list-item'
                                }
                                onClick={() =>
                                  onSelectLesson(
                                    lesson.id,
                                  )
                                }
                              >
                                <strong>
                                  {lesson.code ||
                                    'No Code'}
                                </strong>

                                <span>
                                  {lesson.name}
                                </span>

                                {lessonSubjectFilter ===
                                  'all' && (
                                  <small>
                                    {subject?.name ??
                                      'No Subject'}
                                  </small>
                                )}
                              </button>
                            )
                          },
                        )}
                      </div>
                    )}
                  </section>
                )
              },
            )
          )}
        </div>
    </aside>

    <div
      className="lesson-sidebar-resizer"
      onMouseDown={startSidebarResize}
      title="Drag to resize lesson library"
    />

    <section className="lesson-editor">
        {!selectedLesson ? (
          <div className="lesson-empty-state">
            <h2>Select a lesson</h2>

            <p>
              Choose a lesson from the library or create
              a new one.
            </p>
          </div>
        ) : (
          <>
            <div className="lesson-editor-header">
              <div>
                <h2>
                  {selectedLesson.code
                    ? `${selectedLesson.code} — `
                    : ''}
                  {selectedLesson.name}
                </h2>

                <p>
                  Changes are saved automatically.
                </p>
              </div>

              <button
                className="delete-lesson-button"
                onClick={() =>
                  onDeleteLesson(
                    selectedLesson.id,
                  )
                }
              >
                Delete Lesson
              </button>
            </div>

            <div className="lesson-form">
              <div className="lesson-form-row lesson-form-row-three">
                <label>
                  Subject

                  <select
                    value={
                      selectedLesson.subjectId
                    }
                    onChange={(event) =>
                      onUpdateLesson(
                        selectedLesson.id,
                        {
                          subjectId:
                            event.target.value,
                        },
                      )
                    }
                  >
                    {subjects.map(
                      (subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                        >
                          {subject.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Unit

                  <input
                    type="text"
                    placeholder="Unit 1"
                    value={
                      selectedLesson.unit ?? ''
                    }
                    onChange={(event) =>
                      onUpdateLesson(
                        selectedLesson.id,
                        {
                          unit:
                            event.target.value,
                        },
                      )
                    }
                  />
                </label>

                <label>
                  Lesson Code

                  <input
                    type="text"
                    placeholder="M8-01"
                    value={selectedLesson.code}
                    onChange={(event) =>
                      onUpdateLesson(
                        selectedLesson.id,
                        {
                          code:
                            event.target.value,
                        },
                      )
                    }
                  />
                </label>
              </div>

              <label>
                Lesson Name

                <input
                  type="text"
                  value={selectedLesson.name}
                  onChange={(event) =>
                    onUpdateLesson(
                      selectedLesson.id,
                      {
                        name:
                          event.target.value,
                      },
                    )
                  }
                />
              </label>

              <label>
                Learning Target

                <textarea
                  rows={3}
                  value={
                    selectedLesson.learningTarget
                  }
                  onChange={(event) =>
                    onUpdateLesson(
                      selectedLesson.id,
                      {
                        learningTarget:
                          event.target.value,
                      },
                    )
                  }
                />
              </label>

              <label>
                When You Enter

                <textarea
                  rows={4}
                  value={
                    selectedLesson.instructions
                  }
                  onChange={(event) =>
                    onUpdateLesson(
                      selectedLesson.id,
                      {
                        instructions:
                          event.target.value,
                      },
                    )
                  }
                />
              </label>

              <label>
                Homework

                <textarea
                  rows={3}
                  value={
                    selectedLesson.homework
                  }
                  onChange={(event) =>
                    onUpdateLesson(
                      selectedLesson.id,
                      {
                        homework:
                          event.target.value,
                      },
                    )
                  }
                />
              </label>

              <label>
                Warm-Up

                <textarea
                  rows={6}
                  value={
                    selectedLesson.warmUp
                  }
                  onChange={(event) =>
                    onUpdateLesson(
                      selectedLesson.id,
                      {
                        warmUp:
                          event.target.value,
                      },
                    )
                  }
                />
              </label>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default LessonLibrary