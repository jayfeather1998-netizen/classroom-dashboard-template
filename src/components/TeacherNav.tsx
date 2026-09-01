type TeacherPage = 'setup' | 'lessons' | 'calendar' | 'seating'

type TeacherNavProps = {
  currentPage: TeacherPage
  onChangePage: (page: TeacherPage) => void
}

function TeacherNav({
  currentPage,
  onChangePage,
}: TeacherNavProps) {
  return (
    <nav className="teacher-nav">
      <button
        className={currentPage === 'setup' ? 'active' : ''}
        onClick={() => onChangePage('setup')}
      >
        Setup
      </button>

      <button
        className={currentPage === 'lessons' ? 'active' : ''}
        onClick={() => onChangePage('lessons')}
      >
        Lesson Library
      </button>

      <button
        className={currentPage === 'calendar' ? 'active' : ''}
        onClick={() => onChangePage('calendar')}
      >
        Lesson Calendar
      </button>
      <button
        className={
          currentPage === 'seating'
            ? 'active'
            : ''
        }
        onClick={() =>
          onChangePage('seating')
        }
      >
        Seating
      </button>
    </nav>
  )
}

export default TeacherNav