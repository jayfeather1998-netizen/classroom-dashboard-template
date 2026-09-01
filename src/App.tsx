import {
  createSubject,
  deleteSubjectFromDatabase,
  fetchSubjects,
  fetchPeriods,
  updatePeriod as updatePeriodInDatabase,

  fetchLessons,
  createLessonInDatabase,
  updateLessonInDatabase,
  deleteLessonFromDatabase,

  fetchLessonAssignments,
  saveLessonAssignments,

  fetchSchoolDays,
  saveSchoolDay,

  fetchStudents,
  createStudentInDatabase,
  deleteStudentFromDatabase,

  fetchForbiddenPairs,
  createForbiddenPairInDatabase,
  deleteForbiddenPairFromDatabase,

  fetchSeatingCharts,
  saveSeatingChart,
} from './utils/api'

import { useEffect, useMemo, useState } from 'react'
import './App.css'

import type {
  ClassPeriod,
  Lesson,
  LessonAssignment,
  SchoolDay,
  Subject,
  ForbiddenPair,
  SeatingChart,
  SeatingLayoutMode,
  Student,
} from './types/classroom'

import {
  defaultPeriods,
  defaultSubjects,
} from './data/defaults'

import {
  calculateSeatingLayout,
  createSeatingGroups,
} from './data/seating'

import { loadSavedData } from './utils/storage'

import DisplayMode from './components/DisplayMode'
import TeacherSetup from './components/TeacherSetup'
import LessonLibrary from './components/LessonLibrary'
import TeacherNav from './components/TeacherNav'
import LessonCalendar from './components/LessonCalendar'
import SeatingEditor from './components/SeatingEditor'


const TEACHER_PIN = '7530'

function App() {
  // =========================================================
  // MODE / NAVIGATION STATE
  // =========================================================

  const [mode, setMode] =
    useState<'teacher' | 'display'>('teacher')

  const [teacherPage, setTeacherPage] =
    useState<
      'setup' | 'lessons' | 'calendar' | 'seating'
    >('setup')

  // =========================================================
  // PIN STATE
  // =========================================================

  const [showPinPrompt, setShowPinPrompt] =
    useState(false)

  const [pinEntry, setPinEntry] =
    useState('')

  const [pinError, setPinError] =
    useState('')

  const [pinAction, setPinAction] =
    useState<'teacher' | 'randomize'>('teacher')

  // =========================================================
  // SUBJECT / PERIOD STATE
  // =========================================================

  const [subjects, setSubjects] =
    useState<Subject[]>(() =>
      loadSavedData(
        'dashboard-subjects',
        defaultSubjects,
      ),
    )

  const [periods, setPeriods] =
    useState<ClassPeriod[]>(() =>
      loadSavedData(
        'dashboard-periods',
        defaultPeriods,
      ),
    )

  const [newSubjectName, setNewSubjectName] =
    useState('')

  // =========================================================
  // LESSON STATE
  // =========================================================

  const [lessons, setLessons] = useState<Lesson[]>([])

  const [selectedLessonId, setSelectedLessonId] =
    useState<string | null>(null)

  const [
    lessonSubjectFilter,
    setLessonSubjectFilter,
  ] = useState<string>('all')

  // =========================================================
  // LESSON IMPORT STATE
  // =========================================================

  const [
    showLessonImport,
    setShowLessonImport,
  ] = useState(false)

  const [
    lessonImportText,
    setLessonImportText,
  ] = useState('')

  const [
    lessonImportPreview,
    setLessonImportPreview,
  ] = useState<Lesson[]>([])

  const [
    lessonImportError,
    setLessonImportError,
  ] = useState('')

  // =========================================================
  // CALENDAR STATE
  // =========================================================

  const [lessonAssignments, setLessonAssignments] =
   useState<LessonAssignment[]>([])

  const [schoolDays, setSchoolDays] = useState<SchoolDay[]>([])

  // =========================================================
  // SEATING STATE
  // =========================================================

  const [students, setStudents] =
    useState<Student[]>(() =>
      loadSavedData(
        'dashboard-students',
        [],
      ),
    )

  const [forbiddenPairs, setForbiddenPairs] =
    useState<ForbiddenPair[]>(() =>
      loadSavedData(
        'dashboard-forbidden-pairs',
        [],
      ),
    )

  const [seatingCharts, setSeatingCharts] =
    useState<SeatingChart[]>(() =>
      loadSavedData(
        'dashboard-seating-charts',
        [],
      ),
    )

  // =========================================================
  // DERIVED PERIOD DATA
  // =========================================================

  const availablePeriods = useMemo(
    () =>
      periods.filter(
        (period) => period.type === 'class',
      ),
    [periods],
  )
  const [
    selectedSeatingPeriodId,
    setSelectedSeatingPeriodId,
  ] = useState(
    () => availablePeriods[0]?.id ?? '',
  )

  const [selectedPeriodId, setSelectedPeriodId] =
    useState(
      () => availablePeriods[0]?.id ?? '',
    )

  const selectedPeriod =
    periods.find(
      (period) =>
        period.id === selectedPeriodId,
    ) ?? availablePeriods[0]

  const selectedSubject = subjects.find(
    (subject) =>
      subject.id === selectedPeriod?.subjectId,
  )

  const selectedDisplaySeatingChart =
    seatingCharts.find(
      (chart) =>
        chart.periodId === selectedPeriodId,
    )

  // =========================================================
  // TODAY / DISPLAY DATA
  // =========================================================

  const today = new Date()

  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(
      2,
      '0',
    ),
    String(today.getDate()).padStart(
      2,
      '0',
    ),
  ].join('-')

  const todaySchoolDay =
    schoolDays.find(
      (day) => day.date === todayKey,
    )

  const selectedLessonAssignment =
    todaySchoolDay?.dayType !== 'none' &&
    selectedPeriod?.day === todaySchoolDay?.dayType
      ? lessonAssignments.find(
          (assignment) =>
            assignment.date === todayKey &&
            assignment.periodId ===
              selectedPeriodId,
        )
      : undefined

  const selectedDisplayLesson =
    lessons.find(
      (lesson) =>
        lesson.id ===
        selectedLessonAssignment?.lessonId,
    )

  const dayOfWeek =
    new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
    }).format(today)

  const date =
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(today)

  // =========================================================
  // SAVE DATA
  // =========================================================

  useEffect(() => {
    async function loadLessonsFromDatabase() {
      try {
        const databaseLessons =
          await fetchLessons()

        setLessons(databaseLessons)
      } catch (error) {
        console.error(
          'Could not load lessons from D1:',
          error,
        )
      }
    }

    loadLessonsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadLessonAssignmentsFromDatabase() {
      try {
        const databaseAssignments =
          await fetchLessonAssignments()

        setLessonAssignments(databaseAssignments)
      } catch (error) {
        console.error(
          'Could not load lesson assignments from D1:',
          error,
        )
      }
    }

    loadLessonAssignmentsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadSchoolDaysFromDatabase() {
      try {
        const databaseSchoolDays =
          await fetchSchoolDays()

        setSchoolDays(databaseSchoolDays)
      } catch (error) {
        console.error(
          'Could not load school days from D1:',
          error,
        )
      }
    }

    loadSchoolDaysFromDatabase()
  }, [])

  // Keep selected period valid if a period becomes Prep.
  useEffect(() => {
    const stillExists =
      availablePeriods.some(
        (period) =>
          period.id === selectedPeriodId,
      )

    if (!stillExists) {
      setSelectedPeriodId(
        availablePeriods[0]?.id ?? '',
      )
    }
  }, [
    availablePeriods,
    selectedPeriodId,
  ])

  useEffect(() => {
    localStorage.setItem(
      'dashboard-students',
      JSON.stringify(students),
    )
  }, [students])

  useEffect(() => {
    localStorage.setItem(
      'dashboard-forbidden-pairs',
      JSON.stringify(forbiddenPairs),
    )
  }, [forbiddenPairs])

  useEffect(() => {
    localStorage.setItem(
      'dashboard-seating-charts',
      JSON.stringify(seatingCharts),
    )
  }, [seatingCharts])

  useEffect(() => {
    async function loadSubjectsFromDatabase() {
      try {
        const databaseSubjects =
          await fetchSubjects()

        setSubjects(databaseSubjects)
      } catch (error) {
        console.error(
          'Could not load subjects from D1:',
          error,
        )
      }
    }

    loadSubjectsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadPeriodsFromDatabase() {
      try {
        const databasePeriods =
          await fetchPeriods()

        setPeriods(databasePeriods)
      } catch (error) {
        console.error(
          'Could not load periods from D1:',
          error,
        )
      }
    }

    loadPeriodsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadStudentsFromDatabase() {
      try {
        const databaseStudents =
          await fetchStudents()

        setStudents(databaseStudents)
      } catch (error) {
        console.error(
          'Could not load students from D1:',
          error,
        )
      }
    }

    loadStudentsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadForbiddenPairsFromDatabase() {
      try {
        const databasePairs =
          await fetchForbiddenPairs()

        setForbiddenPairs(databasePairs)
      } catch (error) {
        console.error(
          'Could not load forbidden pairs from D1:',
          error,
        )
      }
    }

    loadForbiddenPairsFromDatabase()
  }, [])

  useEffect(() => {
    async function loadSeatingChartsFromDatabase() {
      try {
        const databaseCharts =
          await fetchSeatingCharts()

        setSeatingCharts(databaseCharts)
      } catch (error) {
        console.error(
          'Could not load seating charts from D1:',
          error,
        )
      }
    }

    loadSeatingChartsFromDatabase()
  }, [])

  // =========================================================
  // PIN FUNCTIONS
  // =========================================================

  function unlockTeacherMode() {
    if (pinEntry !== TEACHER_PIN) {
      setPinError('Incorrect PIN')
      return
    }

    if (pinAction === 'randomize') {
      randomizeSeating(selectedPeriodId)

      setShowPinPrompt(false)
      setPinEntry('')
      setPinError('')
      setPinAction('teacher')
      return
    }

    setMode('teacher')
    setShowPinPrompt(false)
    setPinEntry('')
    setPinError('')
    setPinAction('teacher')
  }

  // =========================================================
  // SUBJECT FUNCTIONS
  // =========================================================

  async function addSubject() {
    const trimmedName =
      newSubjectName.trim()

    if (!trimmedName) return

    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name: trimmedName,
    }

    try {
      await createSubject(newSubject)

      setSubjects([
        ...subjects,
        newSubject,
      ])

      setNewSubjectName('')
    } catch (error) {
      console.error(error)

      window.alert(
        'The subject could not be saved.',
      )
    }
  }

  async function deleteSubject(
    subjectId: string,
  ) {
    const subject = subjects.find(
      (subjectItem) =>
        subjectItem.id === subjectId,
    )

    if (!subject) return

    const usedByPeriod =
      periods.some(
        (period) =>
          period.subjectId === subjectId,
      )

    const usedByLesson =
      lessons.some(
        (lesson) =>
          lesson.subjectId === subjectId,
      )

    if (
      usedByPeriod ||
      usedByLesson
    ) {
      window.alert(
        `"${subject.name}" cannot be deleted because it is still assigned to a class period or lesson.`,
      )
      return
    }

    const confirmed =
      window.confirm(
        `Delete "${subject.name}"?`,
      )

    if (!confirmed) return

    try {
      await deleteSubjectFromDatabase(
        subjectId,
      )

      setSubjects(
        subjects.filter(
          (subjectItem) =>
            subjectItem.id !== subjectId,
        ),
      )
    } catch (error) {
      console.error(error)

      window.alert(
        'The subject could not be deleted.',
      )
    }
  }

  // =========================================================
  // PERIOD FUNCTIONS
  // =========================================================

  async function updatePeriod(
    periodId: string,
    changes: Partial<ClassPeriod>,
  ) {
    const existingPeriod =
      periods.find(
        (period) =>
          period.id === periodId,
      )

    if (!existingPeriod) return

    const updatedPeriod: ClassPeriod = {
      ...existingPeriod,
      ...changes,
    }

    try {
      await updatePeriodInDatabase(
        updatedPeriod,
      )

      setPeriods(
        periods.map((period) =>
          period.id === periodId
            ? updatedPeriod
            : period,
        ),
      )
    } catch (error) {
      console.error(error)

      window.alert(
        'The period could not be saved.',
      )
    }
  }

  // =========================================================
  // LESSON FUNCTIONS
  // =========================================================

  async function createLesson() {
    const subjectId =
      lessonSubjectFilter !== 'all'
        ? lessonSubjectFilter
        : subjects[0]?.id

    if (!subjectId) return

    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      subjectId,
      unit: '',
      code: '',
      name: 'New Lesson',
      learningTarget: '',
      instructions: '',
      homework: '',
      warmUp: '',
    }

    try {
      await createLessonInDatabase(newLesson)

      setLessons([
        ...lessons,
        newLesson,
      ])

      setSelectedLessonId(
        newLesson.id,
      )

      setLessonSubjectFilter(
        subjectId,
      )
    } catch (error) {
      console.error(
        'Could not create lesson in D1:',
        error,
      )

      window.alert(
        'The lesson could not be saved. Please try again.',
      )
    }
  }

  async function updateLesson(
    lessonId: string,
    changes: Partial<Lesson>,
  ) {
    const existingLesson =
      lessons.find(
        (lesson) =>
          lesson.id === lessonId,
      )

    if (!existingLesson) return

    const updatedLesson: Lesson = {
      ...existingLesson,
      ...changes,
    }

    try {
      await updateLessonInDatabase(
        updatedLesson,
      )

      setLessons(
        lessons.map((lesson) =>
          lesson.id === lessonId
            ? updatedLesson
            : lesson,
        ),
      )
    } catch (error) {
      console.error(
        'Could not update lesson in D1:',
        error,
      )

      window.alert(
        'The lesson could not be saved. Please try again.',
      )
    }
  }

  async function deleteLesson(
    lessonId: string,
  ) {
    const lesson = lessons.find(
      (lessonItem) =>
        lessonItem.id === lessonId,
    )

    if (!lesson) return

    const confirmed =
      window.confirm(
        `Delete "${lesson.name}"? This cannot be undone.`,
      )

    if (!confirmed) return

    try {
      await deleteLessonFromDatabase(
        lessonId,
      )

    setLessons(
      lessons.filter(
        (lessonItem) =>
          lessonItem.id !== lessonId,
      ),
    )

    setLessonAssignments(
      lessonAssignments.filter(
        (assignment) =>
          assignment.lessonId !== lessonId,
      ),
    )

    setSelectedLessonId(null)
    } catch (error) {
      console.error(
        'Could not delete lesson from D1:',
        error,
      )

      window.alert(
        'The lesson could not be deleted. Please try again.',
      )
    }
  }

  // =========================================================
  // LESSON IMPORT FUNCTIONS
  // =========================================================

  function previewLessonImport() {
    setLessonImportError('')
    setLessonImportPreview([])

    const trimmed =
      lessonImportText.trim()

    const rows = trimmed
      .split(/\r?\n/)
      .map((row) =>
        row.split('\t'),
      )

    if (rows.length < 2) {
      setLessonImportError(
        'The pasted data needs a header row and at least one lesson.',
      )
      return
    }

    const headers =
      rows[0].map((header) =>
        header
          .trim()
          .toLowerCase(),
      )

    const subjectIndex =
      headers.indexOf('subject')

    const lessonIndex =
      headers.indexOf('lesson')

    const unitIndex =
      headers.indexOf('unit')

    const targetIndex =
      headers.indexOf(
        'learning target',
      )

    const homeworkIndex =
      headers.indexOf('homework')

    const instructionsIndex =
      headers.indexOf(
        'instructions and agenda',
      )

    const warmupIndex =
      headers.indexOf('warmup')

    if (
      subjectIndex === -1 ||
      lessonIndex === -1
    ) {
      setLessonImportError(
        'The import must contain at least a subject and Lesson column.',
      )
      return
    }

    const importedLessons: Lesson[] =
      []

    for (
      const row of rows.slice(1)
    ) {
      const lessonName =
        row[lessonIndex]?.trim() ?? ''

      const subjectName =
        row[subjectIndex]?.trim() ?? ''

      if (
        !lessonName &&
        !subjectName
      ) {
        continue
      }

      if (!lessonName) continue

      const matchingSubject =
        subjects.find(
          (subject) =>
            subject.name.toLowerCase() ===
            subjectName.toLowerCase(),
        )

      if (!matchingSubject) {
        setLessonImportError(
          `Could not find a subject named "${subjectName}". Add that subject in Setup first.`,
        )

        setLessonImportPreview([])
        return
      }

      importedLessons.push({
        id: crypto.randomUUID(),
        subjectId:
          matchingSubject.id,

        unit:
          unitIndex >= 0
            ? row[
                unitIndex
              ]?.trim() ?? ''
            : '',

        code: '',
        name: lessonName,

        learningTarget:
          targetIndex >= 0
            ? row[
                targetIndex
              ]?.trim() ?? ''
            : '',

        homework:
          homeworkIndex >= 0
            ? row[
                homeworkIndex
              ]?.trim() ?? ''
            : '',

        instructions:
          instructionsIndex >= 0
            ? row[
                instructionsIndex
              ]?.trim() ?? ''
            : '',

        warmUp:
          warmupIndex >= 0
            ? row[
                warmupIndex
              ]?.trim() ?? ''
            : '',
      })
    }

    if (
      importedLessons.length === 0
    ) {
      setLessonImportError(
        'No lessons were found.',
      )
      return
    }

    setLessonImportPreview(
      importedLessons,
    )
  }

  async function confirmLessonImport() {
    if (
      lessonImportPreview.length === 0
    ) {
      return
    }

    try {
      for (
        const lesson of lessonImportPreview
      ) {
        await createLessonInDatabase(
          lesson,
        )
      }

      setLessons([
        ...lessons,
        ...lessonImportPreview,
      ])

      setLessonImportText('')
      setLessonImportPreview([])
      setLessonImportError('')
      setShowLessonImport(false)
    } catch (error) {
      console.error(
        'Could not import lessons into D1:',
        error,
      )

      window.alert(
        'The lessons could not be imported. Please try again.',
      )
    }
  }

  // =========================================================
  // CALENDAR FUNCTIONS
  // =========================================================

  async function setSchoolDay(
    date: string,
    dayType: 'A' | 'B' | 'none',
  ) {
    const updatedDay: SchoolDay = {
      date,
      dayType,
    }

    try {
      await saveSchoolDay(updatedDay)

      const existingDay =
        schoolDays.find(
          (day) =>
            day.date === date,
        )

      if (existingDay) {
        setSchoolDays(
          schoolDays.map((day) =>
            day.date === date
              ? updatedDay
              : day,
          ),
        )
      } else {
        setSchoolDays([
          ...schoolDays,
          updatedDay,
        ])
      }
    } catch (error) {
      console.error(
        'Could not save school day to D1:',
        error,
      )

      window.alert(
        'The calendar day could not be saved. Please try again.',
      )
    }
  }

  async function assignLesson(
    date: string,
    periodId: string,
    lessonId: string,
  ) {
    const existingAssignment =
      lessonAssignments.find(
        (assignment) =>
          assignment.date === date &&
          assignment.periodId === periodId,
      )

    let updatedAssignments:
      LessonAssignment[]

    if (!lessonId) {
      updatedAssignments =
        lessonAssignments.filter(
          (assignment) =>
            !(
              assignment.date === date &&
              assignment.periodId ===
                periodId
            ),
        )
    } else if (existingAssignment) {
      updatedAssignments =
        lessonAssignments.map(
          (assignment) =>
            assignment.id ===
            existingAssignment.id
              ? {
                  ...assignment,
                  lessonId,
                }
              : assignment,
        )
    } else {
      updatedAssignments = [
        ...lessonAssignments,
        {
          id: crypto.randomUUID(),
          date,
          periodId,
          lessonId,
        },
      ]
    }

    try {
      await saveLessonAssignments(
        updatedAssignments,
      )

      setLessonAssignments(
        updatedAssignments,
      )
    } catch (error) {
      console.error(
        'Could not save lesson assignments to D1:',
        error,
      )

      window.alert(
        'The lesson assignment could not be saved. Please try again.',
      )
    }
  }

  async function shiftLessonsForward(
    startDate: string,
    dayType: 'A' | 'B',
    periodId?: string,
  ) {
    const matchingDates =
      schoolDays
        .filter(
          (day) =>
            day.dayType ===
              dayType &&
            day.date >= startDate,
        )
        .map(
          (day) => day.date,
        )
        .sort()

    if (
      matchingDates.length < 2
    ) {
      window.alert(
        `There is not another ${dayType} Day scheduled after this date yet.`,
      )
      return
    }

    const periodsToShift =
      periodId
        ? periods.filter(
            (period) =>
              period.id === periodId,
          )
        : periods.filter(
            (period) =>
              period.day ===
                dayType &&
              period.type ===
                'class',
          )

    if (
      periodsToShift.length === 0
    ) {
      return
    }

    const finalDate =
      matchingDates[
        matchingDates.length - 1
      ]

    const finalDateHasAssignments =
      periodsToShift.some(
        (period) =>
          lessonAssignments.some(
            (assignment) =>
              assignment.date ===
                finalDate &&
              assignment.periodId ===
                period.id,
          ),
      )

    if (
      finalDateHasAssignments
    ) {
      window.alert(
        `The last scheduled ${dayType} Day (${finalDate}) already has a lesson that would need to move forward. Mark another future ${dayType} Day on the calendar first, then try again.`,
      )
      return
    }

    const periodIds =
      new Set(
        periodsToShift.map(
          (period) =>
            period.id,
        ),
      )

    const unchangedAssignments =
      lessonAssignments.filter(
        (assignment) =>
          !(
            periodIds.has(
              assignment.periodId,
            ) &&
            matchingDates.includes(
              assignment.date,
            )
          ),
      )

    const shiftedAssignments:
      LessonAssignment[] = []

    for (
      const period of periodsToShift
    ) {
      for (
        let index =
          matchingDates.length - 2;
        index >= 0;
        index--
      ) {
        const sourceDate =
          matchingDates[index]

        const destinationDate =
          matchingDates[index + 1]

        const sourceAssignment =
          lessonAssignments.find(
            (assignment) =>
              assignment.date ===
                sourceDate &&
              assignment.periodId ===
                period.id,
          )

        if (sourceAssignment) {
          shiftedAssignments.push({
            ...sourceAssignment,
            id: crypto.randomUUID(),
            date: destinationDate,
          })
        }
      }
    }
    const updatedAssignments = [
      ...unchangedAssignments,
      ...shiftedAssignments,
    ]

    try {
      await saveLessonAssignments(
        updatedAssignments,
      )

      setLessonAssignments(
        updatedAssignments,
      )
    } catch (error) {
      console.error(
        'Could not save shifted lesson assignments to D1:',
        error,
      )

      window.alert(
        'The lessons could not be shifted. Please try again.',
      )
    }
  }

  // =========================================================
  // SEATING FUNCTIONS
  // =========================================================

  async function addStudent(
    periodId: string,
    firstName: string,
    lastInitial: string,
  ) {
    const trimmedFirstName =
      firstName.trim()

    const trimmedLastInitial =
      lastInitial.trim().slice(0, 1)

    if (
      !trimmedFirstName ||
      !trimmedLastInitial
    ) {
      return
    }

    const newStudent: Student = {
      id: crypto.randomUUID(),
      periodId,
      firstName: trimmedFirstName,
      lastInitial: trimmedLastInitial,
    }

    try {
      await createStudentInDatabase(
        newStudent,
      )

      setStudents(
        (currentStudents) => [
          ...currentStudents,
          newStudent,
        ],
      )
    } catch (error) {
      console.error(error)

      window.alert(
        'The student could not be saved.',
      )
    }
  }

  async function deleteStudent(
    studentId: string,
  ) {
    // Seating assignments are stored as JSON in D1, so deleting
    // the student row cannot automatically remove the student's
    // ID from those saved seating charts.
    const affectedCharts = seatingCharts
      .filter((chart) =>
        Object.values(chart.assignments).includes(
          studentId,
        ),
      )
      .map((chart) => {
        const updatedAssignments = {
          ...chart.assignments,
        }

        for (const seatId of Object.keys(
          updatedAssignments,
        )) {
          if (
            updatedAssignments[seatId] ===
            studentId
          ) {
            updatedAssignments[seatId] = null
          }
        }

        return {
          ...chart,
          assignments: updatedAssignments,
        }
      })

    try {
      // Save the cleaned seating-chart JSON before deleting
      // the student. This prevents stale student IDs in D1.
      for (const chart of affectedCharts) {
        await saveSeatingChart(chart)
      }

      // D1 cascades any forbidden-pair rows that reference
      // this student.
      await deleteStudentFromDatabase(studentId)

      setStudents((currentStudents) =>
        currentStudents.filter(
          (student) =>
            student.id !== studentId,
        ),
      )

      setForbiddenPairs((currentPairs) =>
        currentPairs.filter(
          (pair) =>
            pair.studentId1 !== studentId &&
            pair.studentId2 !== studentId,
        ),
      )

      setSeatingCharts((currentCharts) =>
        currentCharts.map((chart) => {
          const updatedChart =
            affectedCharts.find(
              (affectedChart) =>
                affectedChart.periodId ===
                chart.periodId,
            )

          return updatedChart ?? chart
        }),
      )
    } catch (error) {
      console.error(error)

      window.alert(
        'The student could not be deleted.',
      )
    }
  }

  async function toggleBlockedSeat(
    periodId: string,
    seatId: string,
  ) {
    const existingChart =
      seatingCharts.find(
        (chart) =>
          chart.periodId === periodId,
      )

    const currentlyBlocked =
      existingChart?.blockedSeatIds.includes(
        seatId,
      ) ?? false

    const updatedChart: SeatingChart = {
      periodId,

      assignments: {
        ...(existingChart?.assignments ?? {}),

        ...(currentlyBlocked
          ? {}
          : {
              [seatId]: null,
            }),
      },

      blockedSeatIds:
        currentlyBlocked
          ? (
              existingChart?.blockedSeatIds ??
              []
            ).filter(
              (id) => id !== seatId,
            )
          : [
              ...(
                existingChart?.blockedSeatIds ??
                []
              ),
              seatId,
            ],

      layoutMode:
        existingChart?.layoutMode ??
        'groupCount',

      groupCount:
        existingChart?.groupCount ?? 9,

      groupSize:
        existingChart?.groupSize ?? 4,
    }

    try {
      await saveSeatingChart(
        updatedChart,
      )

      setSeatingCharts(
        (currentCharts) => {
          const chartAlreadyExists =
            currentCharts.some(
              (chart) =>
                chart.periodId ===
                periodId,
            )

          if (chartAlreadyExists) {
            return currentCharts.map(
              (chart) =>
                chart.periodId ===
                periodId
                  ? updatedChart
                  : chart,
            )
          }

          return [
            ...currentCharts,
            updatedChart,
          ]
        },
      )
    } catch (error) {
      console.error(error)

      window.alert(
        'The blocked seat change could not be saved.',
      )
    }
  }

  async function updateSeatingLayout(
    periodId: string,
    layoutMode: SeatingLayoutMode,
    groupCount: number,
    groupSize: number,
  ) {
    await randomizeSeating(
      periodId,
      {
        layoutMode,
        groupCount,
        groupSize,
      },
    )
  }

  async function randomizeSeating(
    periodId: string,
    layoutOverride?: {
      layoutMode: SeatingLayoutMode
      groupCount: number
      groupSize: number
    },
  ) {
    const periodStudents =
      students.filter(
        (student) =>
          student.periodId === periodId,
      )

    const existingChart =
      seatingCharts.find(
        (chart) =>
          chart.periodId === periodId,
      )

    const layoutMode =
      layoutOverride?.layoutMode ??
      existingChart?.layoutMode ??
      'groupCount'

    const storedGroupCount =
      layoutOverride?.groupCount ??
      existingChart?.groupCount ??
      9

    const storedGroupSize =
      layoutOverride?.groupSize ??
      existingChart?.groupSize ??
      4

    const calculatedLayout =
      calculateSeatingLayout(
        periodStudents.length,
        layoutMode,
        storedGroupCount,
        storedGroupSize,
      )

    let groupCount =
      calculatedLayout.groupCount

    let groupSize =
      calculatedLayout.groupSize

    const blockedSeatIds =
      existingChart?.blockedSeatIds ?? []

    // If blocked seats reduce capacity below the
    // class size, enlarge the calculated layout
    // until everyone can still receive a seat.
    function getAvailableSeatCount() {
      let count = 0

      for (
        let groupNumber = 1;
        groupNumber <= groupCount;
        groupNumber++
      ) {
        for (
          let position = 1;
          position <= groupSize;
          position++
        ) {
          const seatId =
            `g${groupNumber}-s${position}`

          if (
            !blockedSeatIds.includes(
              seatId,
            )
          ) {
            count++
          }
        }
      }

      return count
    }

    while (
      getAvailableSeatCount() <
      periodStudents.length
    ) {
      if (
        layoutMode === 'groupSize'
      ) {
        groupCount++
      } else {
        groupSize++
      }
    }

    // A layout can be saved even before a roster
    // has been entered.
    if (
      periodStudents.length === 0
    ) {
      if (!layoutOverride) {
        window.alert(
          'There are no students in this class yet.',
        )

        return
      }

      const emptyChart: SeatingChart = {
        periodId,
        assignments: {},
        blockedSeatIds,
        layoutMode,
        groupCount,
        groupSize,
      }

      try {
        await saveSeatingChart(
          emptyChart,
        )

        setSeatingCharts(
          (currentCharts) => {
            const exists =
              currentCharts.some(
                (chart) =>
                  chart.periodId ===
                  periodId,
              )

            if (exists) {
              return currentCharts.map(
                (chart) =>
                  chart.periodId ===
                  periodId
                    ? emptyChart
                    : chart,
              )
            }

            return [
              ...currentCharts,
              emptyChart,
            ]
          },
        )
      } catch (error) {
        console.error(error)

        window.alert(
          'The seating layout could not be saved.',
        )
      }

      return
    }

    const currentForbiddenPairs =
      forbiddenPairs.filter(
        (pair) =>
          pair.periodId === periodId,
      )

    const groups =
      createSeatingGroups(
        groupCount,
      )

    const seatsByGroup =
      groups.map((group) =>
        Array.from(
          { length: groupSize },
          (_, index) =>
            `g${group.groupNumber}-s${index + 1}`,
        ).filter(
          (seatId) =>
            !blockedSeatIds.includes(
              seatId,
            ),
        ),
      )

    function studentsAreForbiddenTogether(
      studentId1: string,
      studentId2: string,
    ) {
      return currentForbiddenPairs.some(
        (pair) =>
          (
            pair.studentId1 ===
              studentId1 &&
            pair.studentId2 ===
              studentId2
          ) ||
          (
            pair.studentId1 ===
              studentId2 &&
            pair.studentId2 ===
              studentId1
          ),
      )
    }

    const constraintCounts =
      new Map<string, number>()

    for (
      const student of periodStudents
    ) {
      const count =
        currentForbiddenPairs.filter(
          (pair) =>
            pair.studentId1 ===
              student.id ||
            pair.studentId2 ===
              student.id,
        ).length

      constraintCounts.set(
        student.id,
        count,
      )
    }

    const shuffledStudents = [
      ...periodStudents,
    ]

    for (
      let i =
        shuffledStudents.length - 1;
      i > 0;
      i--
    ) {
      const j = Math.floor(
        Math.random() * (i + 1),
      )

      const temp =
        shuffledStudents[i]

      shuffledStudents[i] =
        shuffledStudents[j]

      shuffledStudents[j] = temp
    }

    shuffledStudents.sort(
      (studentA, studentB) =>
        (
          constraintCounts.get(
            studentB.id,
          ) ?? 0
        ) -
        (
          constraintCounts.get(
            studentA.id,
          ) ?? 0
        ),
    )

    const groupStudents:
      Student[][] =
        groups.map(() => [])

    function canJoinGroup(
      student: Student,
      groupIndex: number,
    ) {
      if (
        groupStudents[groupIndex]
          .length >=
        seatsByGroup[groupIndex]
          .length
      ) {
        return false
      }

      return groupStudents[
        groupIndex
      ].every(
        (existingStudent) =>
          !studentsAreForbiddenTogether(
            student.id,
            existingStudent.id,
          ),
      )
    }

    function assignStudent(
      studentIndex: number,
    ): boolean {
      if (
        studentIndex >=
        shuffledStudents.length
      ) {
        return true
      }

      const student =
        shuffledStudents[
          studentIndex
        ]

      const possibleGroups =
        groups
          .map(
            (_, groupIndex) =>
              groupIndex,
          )
          .filter(
            (groupIndex) =>
              canJoinGroup(
                student,
                groupIndex,
              ),
          )
          .sort(
            (
              groupA,
              groupB,
            ) => {
              const sizeDifference =
                groupStudents[
                  groupA
                ].length -
                groupStudents[
                  groupB
                ].length

              if (
                sizeDifference !== 0
              ) {
                return sizeDifference
              }

              return (
                Math.random() - 0.5
              )
            },
          )

      for (
        const groupIndex of possibleGroups
      ) {
        groupStudents[
          groupIndex
        ].push(student)

        if (
          assignStudent(
            studentIndex + 1,
          )
        ) {
          return true
        }

        groupStudents[
          groupIndex
        ].pop()
      }

      return false
    }

    const success =
      assignStudent(0)

    if (!success) {
      window.alert(
        'A valid seating arrangement could not be created with the current blocked seats and forbidden pairs. The existing seating chart was not changed.',
      )

      return
    }

    const assignments: Record<
      string,
      string | null
    > = {}

    for (
      let groupIndex = 0;
      groupIndex <
      seatsByGroup.length;
      groupIndex++
    ) {
      const groupSeats =
        seatsByGroup[
          groupIndex
        ]

      const assignedStudents =
        groupStudents[
          groupIndex
        ]

      groupSeats.forEach(
        (
          seatId,
          seatIndex,
        ) => {
          assignments[seatId] =
            assignedStudents[
              seatIndex
            ]?.id ?? null
        },
      )
    }

    const newChart: SeatingChart = {
      periodId,
      assignments,
      blockedSeatIds,
      layoutMode,
      groupCount,
      groupSize,
    }

    try {
      await saveSeatingChart(
        newChart,
      )
    } catch (error) {
      console.error(error)

      window.alert(
        'The seating chart could not be saved.',
      )

      return
    }

    setSeatingCharts(
      (currentCharts) => {
        const chartAlreadyExists =
          currentCharts.some(
            (chart) =>
              chart.periodId ===
              periodId,
          )

        if (chartAlreadyExists) {
          return currentCharts.map(
            (chart) =>
              chart.periodId ===
              periodId
                ? newChart
                : chart,
          )
        }

        return [
          ...currentCharts,
          newChart,
        ]
      },
    )
  }

  async function addForbiddenPair(
    periodId: string,
    studentId1: string,
    studentId2: string,
  ) {
    if (studentId1 === studentId2) {
      return
    }

    const pairAlreadyExists =
      forbiddenPairs.some(
        (pair) =>
          pair.periodId === periodId &&
          (
            (
              pair.studentId1 === studentId1 &&
              pair.studentId2 === studentId2
            ) ||
            (
              pair.studentId1 === studentId2 &&
              pair.studentId2 === studentId1
            )
          ),
      )

    if (pairAlreadyExists) {
      window.alert(
        'That forbidden pair already exists.',
      )
      return
    }

    const newPair: ForbiddenPair = {
      id: crypto.randomUUID(),
      periodId,
      studentId1,
      studentId2,
    }

    try {
      await createForbiddenPairInDatabase(newPair)

      setForbiddenPairs((currentPairs) => [
        ...currentPairs,
        newPair,
      ])
    } catch (error) {
      console.error(error)

      window.alert(
        'The forbidden pair could not be saved.',
      )
    }
  }

  async function deleteForbiddenPair(
    pairId: string,
  ) {
    try {
      await deleteForbiddenPairFromDatabase(pairId)

      setForbiddenPairs((currentPairs) =>
        currentPairs.filter(
          (pair) => pair.id !== pairId,
        ),
      )
    } catch (error) {
      console.error(error)

      window.alert(
        'The forbidden pair could not be deleted.',
      )
    }
  }

  async function swapSeats(
    periodId: string,
    firstSeatId: string,
    secondSeatId: string,
  ): Promise<boolean> {
    const chart = seatingCharts.find(
      (chart) => chart.periodId === periodId,
    )

    if (!chart) {
      window.alert('No seating chart exists for this class.')
      return false
    }

    if (
      chart.blockedSeatIds.includes(firstSeatId) ||
      chart.blockedSeatIds.includes(secondSeatId)
    ) {
      window.alert(
        'A blocked seat cannot be used for a student.',
      )
      return false
    }

    const firstStudentId =
      chart.assignments[firstSeatId] ?? null

    const secondStudentId =
      chart.assignments[secondSeatId] ?? null

    if (!firstStudentId) {
      return false
    }

    const proposedAssignments = {
      ...chart.assignments,
    }

    proposedAssignments[firstSeatId] =
      secondStudentId

    proposedAssignments[secondSeatId] =
      firstStudentId

    const periodForbiddenPairs =
      forbiddenPairs.filter(
        (pair) => pair.periodId === periodId,
      )

    function getStudentGroup(
      studentId: string,
    ): string | null {
      for (const [
        seatId,
        assignedStudentId,
      ] of Object.entries(proposedAssignments)) {
        if (assignedStudentId === studentId) {
          return seatId.split('-')[0]
        }
      }

      return null
    }

    for (const pair of periodForbiddenPairs) {
      const group1 = getStudentGroup(
        pair.studentId1,
      )

      const group2 = getStudentGroup(
        pair.studentId2,
      )

      if (
        group1 !== null &&
        group2 !== null &&
        group1 === group2
      ) {
        window.alert(
          'That move would place a forbidden pair in the same group.',
        )

        return false
      }
    }

    const updatedChart: SeatingChart = {
      ...chart,
      assignments: proposedAssignments,
    }

    try {
      await saveSeatingChart(updatedChart)
    } catch (error) {
      console.error(error)

      window.alert(
        'The seating change could not be saved.',
      )
      return false
    }

    setSeatingCharts((currentCharts) =>
      currentCharts.map((currentChart) => {
        if (
          currentChart.periodId !== periodId
        ) {
          return currentChart
        }

        return {
          ...currentChart,
          assignments: proposedAssignments,
        }
      }),
    )

    return true
  }

  // =========================================================
  // DISPLAY MODE
  // =========================================================

  if (
    mode === 'display' &&
    selectedPeriod
  ) {
    return (
      <DisplayMode
        selectedPeriod={
          selectedPeriod
        }
        selectedSubject={
          selectedSubject
        }
        lesson={
          selectedDisplayLesson
        }
        availablePeriods={
          availablePeriods
        }
        selectedPeriodId={
          selectedPeriodId
        }
        dayOfWeek={
          dayOfWeek
        }
        date={
          date
        }
        showPinPrompt={
          showPinPrompt
        }
        pinEntry={
          pinEntry
        }
        pinError={
          pinError
        }
        onSelectPeriod={
          setSelectedPeriodId
        }
        onOpenPin={() => {
          setPinAction('teacher')
          setShowPinPrompt(true)
          setPinEntry('')
          setPinError('')
        }}
        onRequestSeatingRandomize={() => {
          setPinAction('randomize')
          setShowPinPrompt(true)
          setPinEntry('')
          setPinError('')
        }}
        onClosePin={() => {
          setShowPinPrompt(false)
          setPinEntry('')
          setPinError('')
        }}
        onPinChange={
          setPinEntry
        }
        onUnlockTeacherMode={
          unlockTeacherMode
        }
        students={students}
        seatingChart={selectedDisplaySeatingChart}
      />
    )
  }

  // =========================================================
  // TEACHER MODE
  // =========================================================

  return (
    <div className="teacher-mode">
      <header className="teacher-header">
        <div>
          <h1>
            Classroom Dashboard
          </h1>
          <p>Teacher Setup</p>
        </div>

        <button
          className="display-button"
          onClick={() =>
            setMode('display')
          }
        >
          Open Display Mode
        </button>
      </header>

      <TeacherNav
        currentPage={
          teacherPage
        }
        onChangePage={
          setTeacherPage
        }
      />

      {teacherPage === 'setup' && (
        <TeacherSetup
          subjects={subjects}
          periods={periods}
          newSubjectName={
            newSubjectName
          }
          onNewSubjectNameChange={
            setNewSubjectName
          }
          onAddSubject={
            addSubject
          }
          onDeleteSubject={
            deleteSubject
          }
          onUpdatePeriod={
            updatePeriod
          }
        />
      )}

      {teacherPage ===
        'lessons' && (
        <LessonLibrary
          subjects={subjects}
          lessons={lessons}
          selectedLessonId={
            selectedLessonId
          }
          lessonSubjectFilter={
            lessonSubjectFilter
          }
          showLessonImport={
            showLessonImport
          }
          lessonImportText={
            lessonImportText
          }
          lessonImportPreview={
            lessonImportPreview
          }
          lessonImportError={
            lessonImportError
          }
          onCreateLesson={
            createLesson
          }
          onSelectLesson={
            setSelectedLessonId
          }
          onSubjectFilterChange={
            setLessonSubjectFilter
          }
          onUpdateLesson={
            updateLesson
          }
          onDeleteLesson={
            deleteLesson
          }
          onOpenImport={() => {
            setShowLessonImport(
              true,
            )
            setLessonImportText('')
            setLessonImportPreview(
              [],
            )
            setLessonImportError('')
          }}
          onCloseImport={() => {
            setShowLessonImport(
              false,
            )
            setLessonImportText('')
            setLessonImportPreview(
              [],
            )
            setLessonImportError('')
          }}
          onImportTextChange={
            setLessonImportText
          }
          onPreviewImport={
            previewLessonImport
          }
          onConfirmImport={
            confirmLessonImport
          }
        />
      )}

      {teacherPage ===
        'calendar' && (
        <LessonCalendar
          subjects={subjects}
          periods={periods}
          lessons={lessons}
          lessonAssignments={
            lessonAssignments
          }
          schoolDays={
            schoolDays
          }
          onSetSchoolDay={
            setSchoolDay
          }
          onAssignLesson={
            assignLesson
          }
          onShiftLessons={
            shiftLessonsForward
          }
        />
      )}

      {teacherPage === 'seating' && (
        <SeatingEditor
          periods={periods}
          students={students}
          seatingCharts={seatingCharts}
          forbiddenPairs={forbiddenPairs}
          selectedPeriodId={
            selectedSeatingPeriodId
          }
          onSelectPeriod={
            setSelectedSeatingPeriodId
          }
          onAddStudent={
            addStudent
          }
          onDeleteStudent={
            deleteStudent
          }
          onToggleBlockedSeat={
            toggleBlockedSeat
          }
          onRandomizeSeating={
            randomizeSeating
          }
          onUpdateSeatingLayout={
            updateSeatingLayout
          }
          onAddForbiddenPair={
            addForbiddenPair
          }
          onDeleteForbiddenPair={
            deleteForbiddenPair
          }
          onSwapSeats={
            swapSeats
          }
        />
      )}

    </div>
  )
}

export default App