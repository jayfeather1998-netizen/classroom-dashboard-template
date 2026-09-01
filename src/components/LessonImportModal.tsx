import type { Lesson, Subject } from '../types/classroom'

type LessonImportModalProps = {
  subjects: Subject[]
  importText: string
  importPreview: Lesson[]
  importError: string
  onImportTextChange: (value: string) => void
  onPreviewImport: () => void
  onConfirmImport: () => void
  onClose: () => void
}

function LessonImportModal({
  subjects,
  importText,
  importPreview,
  importError,
  onImportTextChange,
  onPreviewImport,
  onConfirmImport,
  onClose,
}: LessonImportModalProps) {
  return (
    <div className="lesson-import-overlay">
      <div className="lesson-import-box">
        <div className="lesson-import-header">
          <div>
            <h2>Import Lessons</h2>
            <p>
              Copy your lesson table from Excel and paste it below.
            </p>
          </div>

          <button onClick={onClose}>
            Close
          </button>
        </div>

        <textarea
          className="lesson-import-textarea"
          placeholder={
            'subject\tLesson\tLearning Target\thomework\tInstructions and Agenda\twarmup'
          }
          value={importText}
          onChange={(event) =>
            onImportTextChange(event.target.value)
          }
        />

        {importError && (
          <p className="lesson-import-error">
            {importError}
          </p>
        )}

        <div className="lesson-import-controls">
          <button onClick={onPreviewImport}>
            Preview Import
          </button>

          {importPreview.length > 0 && (
            <button
              className="import-confirm-button"
              onClick={onConfirmImport}
            >
              Import {importPreview.length} Lessons
            </button>
          )}
        </div>

        {importPreview.length > 0 && (
          <div className="lesson-import-preview">
            <h3>
              Preview — {importPreview.length} lessons
            </h3>

            <div className="import-preview-table">
              <div className="import-preview-row import-preview-heading">
                <span>Subject</span>
                <span>Lesson</span>
                <span>Learning Target</span>
                <span>Homework</span>
              </div>

              {importPreview.map((lesson) => {
                const subject = subjects.find(
                  (item) => item.id === lesson.subjectId,
                )

                return (
                  <div
                    className="import-preview-row"
                    key={lesson.id}
                  >
                    <span>
                      {subject?.name ?? 'Unknown'}
                    </span>

                    <span>{lesson.name}</span>

                    <span>
                      {lesson.learningTarget || '—'}
                    </span>

                    <span>
                      {lesson.homework || '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonImportModal