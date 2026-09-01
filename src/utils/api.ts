import type {
  ClassPeriod,
  ForbiddenPair,
  Lesson,
  LessonAssignment,
  SchoolDay,
  SeatingChart,
  Student,
  Subject,
} from '../types/classroom'

const API_BASE =
  import.meta.env.DEV
    ? 'http://localhost:8787'
    : ''

async function requireOk(
  response: Response,
  message: string,
) {
  if (!response.ok) {
    throw new Error(message)
  }
}

// ============================================================
// SUBJECTS
// ============================================================

export async function fetchSubjects(): Promise<Subject[]> {
  const response = await fetch(
    `${API_BASE}/api/subjects`,
  )

  await requireOk(
    response,
    'Failed to load subjects.',
  )

  return response.json()
}

export async function createSubject(
  subject: Subject,
): Promise<Subject> {
  const response = await fetch(
    `${API_BASE}/api/subjects`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subject),
    },
  )

  await requireOk(
    response,
    'Failed to create subject.',
  )

  return response.json()
}

export async function deleteSubjectFromDatabase(
  subjectId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/subjects/${encodeURIComponent(
      subjectId,
    )}`,
    {
      method: 'DELETE',
    },
  )

  await requireOk(
    response,
    'Failed to delete subject.',
  )
}

// ============================================================
// PERIODS
// ============================================================

export async function fetchPeriods(): Promise<ClassPeriod[]> {
  const response = await fetch(
    `${API_BASE}/api/periods`,
  )

  await requireOk(
    response,
    'Failed to load periods.',
  )

  return response.json()
}

export async function createPeriod(
  period: ClassPeriod,
): Promise<ClassPeriod> {
  const response = await fetch(
    `${API_BASE}/api/periods`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(period),
    },
  )

  await requireOk(
    response,
    'Failed to create period.',
  )

  return response.json()
}

export async function updatePeriod(
  period: ClassPeriod,
): Promise<ClassPeriod> {
  const response = await fetch(
    `${API_BASE}/api/periods/${encodeURIComponent(
      period.id,
    )}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(period),
    },
  )

  await requireOk(
    response,
    'Failed to update period.',
  )

  return response.json()
}

// ============================================================
// LESSONS
// ============================================================

export async function fetchLessons(): Promise<Lesson[]> {
  const response = await fetch(
    `${API_BASE}/api/lessons`,
  )

  await requireOk(
    response,
    'Failed to load lessons.',
  )

  return response.json()
}

export async function createLessonInDatabase(
  lesson: Lesson,
): Promise<Lesson> {
  const response = await fetch(
    `${API_BASE}/api/lessons`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lesson),
    },
  )

  await requireOk(
    response,
    'Failed to create lesson.',
  )

  return response.json()
}

export async function updateLessonInDatabase(
  lesson: Lesson,
): Promise<Lesson> {
  const response = await fetch(
    `${API_BASE}/api/lessons/${encodeURIComponent(
      lesson.id,
    )}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lesson),
    },
  )

  await requireOk(
    response,
    'Failed to update lesson.',
  )

  return response.json()
}

export async function deleteLessonFromDatabase(
  lessonId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/lessons/${encodeURIComponent(
      lessonId,
    )}`,
    {
      method: 'DELETE',
    },
  )

  await requireOk(
    response,
    'Failed to delete lesson.',
  )
}

// ============================================================
// LESSON ASSIGNMENTS
// ============================================================

export async function fetchLessonAssignments(): Promise<
  LessonAssignment[]
> {
  const response = await fetch(
    `${API_BASE}/api/lesson-assignments`,
  )

  await requireOk(
    response,
    'Failed to load lesson assignments.',
  )

  return response.json()
}

export async function saveLessonAssignments(
  assignments: LessonAssignment[],
): Promise<LessonAssignment[]> {
  const response = await fetch(
    `${API_BASE}/api/lesson-assignments`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignments),
    },
  )

  await requireOk(
    response,
    'Failed to save lesson assignments.',
  )

  return response.json()
}

// ============================================================
// SCHOOL DAYS
// ============================================================

export async function fetchSchoolDays(): Promise<SchoolDay[]> {
  const response = await fetch(
    `${API_BASE}/api/school-days`,
  )

  await requireOk(
    response,
    'Failed to load school days.',
  )

  return response.json()
}

export async function saveSchoolDay(
  schoolDay: SchoolDay,
): Promise<SchoolDay> {
  const response = await fetch(
    `${API_BASE}/api/school-days/${encodeURIComponent(
      schoolDay.date,
    )}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schoolDay),
    },
  )

  await requireOk(
    response,
    'Failed to save school day.',
  )

  return response.json()
}

// ============================================================
// STUDENTS
// ============================================================

export async function fetchStudents(): Promise<Student[]> {
  const response = await fetch(
    `${API_BASE}/api/students`,
  )

  await requireOk(
    response,
    'Failed to load students.',
  )

  return response.json()
}

export async function createStudentInDatabase(
  student: Student,
): Promise<Student> {
  const response = await fetch(
    `${API_BASE}/api/students`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    },
  )

  await requireOk(
    response,
    'Failed to create student.',
  )

  return response.json()
}

export async function deleteStudentFromDatabase(
  studentId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/students/${encodeURIComponent(
      studentId,
    )}`,
    {
      method: 'DELETE',
    },
  )

  await requireOk(
    response,
    'Failed to delete student.',
  )
}

// ============================================================
// FORBIDDEN PAIRS
// ============================================================

export async function fetchForbiddenPairs(): Promise<
  ForbiddenPair[]
> {
  const response = await fetch(
    `${API_BASE}/api/forbidden-pairs`,
  )

  await requireOk(
    response,
    'Failed to load forbidden pairs.',
  )

  return response.json()
}

export async function createForbiddenPairInDatabase(
  pair: ForbiddenPair,
): Promise<ForbiddenPair> {
  const response = await fetch(
    `${API_BASE}/api/forbidden-pairs`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pair),
    },
  )

  await requireOk(
    response,
    'Failed to create forbidden pair.',
  )

  return response.json()
}

export async function deleteForbiddenPairFromDatabase(
  pairId: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/forbidden-pairs/${encodeURIComponent(
      pairId,
    )}`,
    {
      method: 'DELETE',
    },
  )

  await requireOk(
    response,
    'Failed to delete forbidden pair.',
  )
}

// ============================================================
// SEATING CHARTS
// ============================================================

export async function fetchSeatingCharts(): Promise<
  SeatingChart[]
> {
  const response = await fetch(
    `${API_BASE}/api/seating-charts`,
  )

  await requireOk(
    response,
    'Failed to load seating charts.',
  )

  return response.json()
}

export async function saveSeatingChart(
  chart: SeatingChart,
): Promise<SeatingChart> {
  const response = await fetch(
    `${API_BASE}/api/seating-charts/${encodeURIComponent(
      chart.periodId,
    )}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chart),
    },
  )

  await requireOk(
    response,
    'Failed to save seating chart.',
  )

  return response.json()
}

// ============================================================
// APP SETTINGS
// ============================================================

export async function fetchTeacherPin(): Promise<string> {
  const response = await fetch(
    `${API_BASE}/api/settings/teacher-pin`,
  )

  await requireOk(
    response,
    'Failed to load teacher PIN.',
  )

  const data =
    (await response.json()) as {
      teacherPin: string
    }

  return data.teacherPin
}

export async function updateTeacherPinInDatabase(
  currentPin: string,
  newPin: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/settings/teacher-pin`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPin,
        newPin,
      }),
    },
  )

  if (!response.ok) {
    const data =
      (await response.json()) as {
        error?: string
      }

    throw new Error(
      data.error ??
        'Failed to update teacher PIN.',
    )
  }
}

export async function updateSitePasswordInDatabase(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/settings/site-password`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    },
  )

  if (!response.ok) {
    const data =
      (await response.json()) as {
        error?: string
      }

    throw new Error(
      data.error ??
        'Failed to update site password.',
    )
  }
}