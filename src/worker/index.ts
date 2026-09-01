import type { D1Database } from '@cloudflare/workers-types'

interface Env {
  classroom_dashboard: D1Database
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

type Subject = { id: string; name: string }
type Period = { id: string; number: number; day: 'A' | 'B'; type: 'class' | 'prep'; subjectId: string | null; colorName: string; accent: string; light: string; text: string }
type Lesson = { id: string; subjectId: string; unit: string; code: string; name: string; learningTarget: string; instructions: string; homework: string; warmUp: string }
type LessonAssignment = { id: string; date: string; periodId: string; lessonId: string }
type SchoolDay = { date: string; dayType: 'A' | 'B' | 'none' }
type Student = { id: string; periodId: string; firstName: string; lastInitial: string }
type ForbiddenPair = { id: string; periodId: string; studentId1: string; studentId2: string }
type SeatingChart = {
  periodId: string
  assignments: Record<string, string | null>
  blockedSeatIds: string[]
  layoutMode: 'groupCount' | 'groupSize'
  groupCount: number
  groupSize: number
}

const AUTH_COOKIE = 'classroom_auth'
const AUTH_MAX_AGE = 60 * 60 * 24 * 30

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders() })
}

function getAuthCookie(
  request: Request,
): string | null {
  const cookie =
    request.headers.get('Cookie') ?? ''

  for (const part of cookie.split(';')) {
    const trimmed = part.trim()

    const prefix =
      `${AUTH_COOKIE}=`

    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(
        trimmed.slice(prefix.length),
      )
    }
  }

  return null
}

async function sha256(
  value: string,
): Promise<string> {
  const encoded =
    new TextEncoder().encode(value)

  const hash =
    await crypto.subtle.digest(
      'SHA-256',
      encoded,
    )

  return Array.from(
    new Uint8Array(hash),
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
}

function createRandomToken(): string {
  const bytes =
    new Uint8Array(32)

  crypto.getRandomValues(bytes)

  return Array.from(bytes)
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
}

async function getSetting(
  db: D1Database,
  key: string,
): Promise<string | null> {
  const result = await db
    .prepare(
      `SELECT value
       FROM app_settings
       WHERE key = ?`,
    )
    .bind(key)
    .first<{ value: string }>()

  return result?.value ?? null
}

async function saveSetting(
  db: D1Database,
  key: string,
  value: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO app_settings (
        key,
        value
      )
      VALUES (?, ?)
      ON CONFLICT(key)
      DO UPDATE SET
        value = excluded.value`,
    )
    .bind(
      key,
      value,
    )
    .run()
}

async function hasValidAuthCookie(
  request: Request,
  db: D1Database,
): Promise<boolean> {
  const cookieToken =
    getAuthCookie(request)

  if (!cookieToken) {
    return false
  }

  const storedToken =
    await getSetting(
      db,
      'site_auth_token',
    )

  if (!storedToken) {
    return false
  }

  return cookieToken === storedToken
}

function passwordPage(error = false): Response {
  const errorMessage = error
    ? `<div class="error">Incorrect password. Please try again.</div>`
    : ''

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Classroom Dashboard</title>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #111318;
      color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
    }

    .login-card {
      width: min(420px, 100%);
      padding: 36px;
      border-radius: 18px;
      background: #191c23;
      box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
    }

    h1 {
      margin: 0 0 8px;
      font-size: 2rem;
      text-align: center;
    }

    p {
      margin: 0 0 26px;
      color: #c8ccd4;
      text-align: center;
      line-height: 1.45;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 700;
    }

    input {
      width: 100%;
      padding: 13px 14px;
      border: 1px solid #4b515d;
      border-radius: 9px;
      background: #0f1115;
      color: #ffffff;
      font-size: 1rem;
    }

    input:focus {
      outline: 2px solid #69b9de;
      outline-offset: 2px;
    }

    button {
      width: 100%;
      margin-top: 18px;
      padding: 13px;
      border: 0;
      border-radius: 9px;
      background: #69b9de;
      color: #102631;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
    }

    .error {
      margin-bottom: 18px;
      padding: 10px 12px;
      border-radius: 8px;
      background: #542329;
      color: #ffd9dd;
      text-align: center;
    }
  </style>
</head>
<body>
  <main class="login-card">
    <h1>Classroom Dashboard</h1>
    <p>Enter the classroom password to continue.</p>

    ${errorMessage}

    <form method="POST" action="/login">
      <label for="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autocomplete="current-password"
        autofocus
        required
      />
      <button type="submit">Open Dashboard</button>
    </form>
  </main>
</body>
</html>`

  return new Response(html, {
    status: error ? 401 : 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  })
}

async function handleLogin(
  request: Request,
  env: Env,
): Promise<Response> {
  const form =
    await request.formData()

  const submittedPassword =
    form.get('password')

  if (
    typeof submittedPassword !==
    'string'
  ) {
    return passwordPage(true)
  }

  const db =
    env.classroom_dashboard

  const salt =
    await getSetting(
      db,
      'site_password_salt',
    )

  const storedHash =
    await getSetting(
      db,
      'site_password_hash',
    )

  if (!salt || !storedHash) {
    return new Response(
      'Site password settings are missing. Apply the database migrations and try again.',
      {
        status: 500,
        headers: {
          'Content-Type':
            'text/plain; charset=UTF-8',
        },
      },
    )
  }

  const submittedHash =
    await sha256(
      salt + submittedPassword,
    )

  if (
    submittedHash !== storedHash
  ) {
    return passwordPage(true)
  }

  let authToken =
    await getSetting(
      db,
      'site_auth_token',
    )

  if (!authToken) {
    authToken =
      createRandomToken()

    await saveSetting(
      db,
      'site_auth_token',
      authToken,
    )
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: '/',
      'Set-Cookie':
        `${AUTH_COOKIE}=${encodeURIComponent(
          authToken,
        )}; Max-Age=${AUTH_MAX_AGE}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      'Cache-Control': 'no-store',
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // CORS preflight requests must be answered before authentication.
    // Browsers send OPTIONS before local-development API writes.
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    // Handle the password submission before checking authentication.
    if (request.method === 'POST' && url.pathname === '/login') {
      return handleLogin(request, env)
    }

    const isLocalDevelopment =
      url.hostname === '127.0.0.1' ||
      url.hostname === 'localhost'

    // Production is password-protected. Local Wrangler development
    // is allowed through so the Vite app can call the local API
    // without relying on a Secure production cookie.
    if (
      !isLocalDevelopment &&
      !await hasValidAuthCookie(
        request,
        env.classroom_dashboard,
      )
    ) {
      // API requests should not receive an HTML login page.
      if (url.pathname.startsWith('/api/')) {
        return jsonResponse({ error: 'Authentication required.' }, 401)
      }

      return passwordPage()
    }

    const db = env.classroom_dashboard

    // =========================================================
    // APP SETTINGS
    // =========================================================

    if (
      request.method === 'GET' &&
      url.pathname === '/api/settings/teacher-pin'
    ) {
      const result = await db
        .prepare(
          `SELECT value
          FROM app_settings
          WHERE key = 'teacher_pin'`,
        )
        .first<{ value: string }>()

      return jsonResponse({
        teacherPin:
          result?.value ?? '1234',
      })
    }

    if (
      request.method === 'PUT' &&
      url.pathname === '/api/settings/teacher-pin'
    ) {
      const body =
        (await request.json()) as {
          currentPin?: string
          newPin?: string
        }

      const currentPin =
        body.currentPin ?? ''

      const newPin =
        body.newPin ?? ''

      if (!/^\d{4}$/.test(newPin)) {
        return jsonResponse(
          {
            error:
              'The new PIN must contain exactly 4 digits.',
          },
          400,
        )
      }

      const existing = await db
        .prepare(
          `SELECT value
          FROM app_settings
          WHERE key = 'teacher_pin'`,
        )
        .first<{ value: string }>()

      const storedPin =
        existing?.value ?? '1234'

      if (currentPin !== storedPin) {
        return jsonResponse(
          {
            error:
              'The current PIN is incorrect.',
          },
          403,
        )
      }

      await db
        .prepare(
          `INSERT INTO app_settings (key, value)
          VALUES ('teacher_pin', ?)
          ON CONFLICT(key)
          DO UPDATE SET value = excluded.value`,
        )
        .bind(newPin)
        .run()

      return jsonResponse({
        ok: true,
      })
    }

    // =========================================================
    // SITE PASSWORD
    // =========================================================

    if (
      request.method === 'PUT' &&
      url.pathname ===
        '/api/settings/site-password'
    ) {
      const body =
        (await request.json()) as {
          currentPassword?: string
          newPassword?: string
        }

      const currentPassword =
        body.currentPassword ?? ''

      const newPassword =
        body.newPassword ?? ''

      if (newPassword.length < 6) {
        return jsonResponse(
          {
            error:
              'The new site password must contain at least 6 characters.',
          },
          400,
        )
      }

      const currentSalt =
        await getSetting(
          db,
          'site_password_salt',
        )

      const currentHash =
        await getSetting(
          db,
          'site_password_hash',
        )

      if (
        !currentSalt ||
        !currentHash
      ) {
        return jsonResponse(
          {
            error:
              'Site password settings are missing.',
          },
          500,
        )
      }

      const submittedHash =
        await sha256(
          currentSalt +
            currentPassword,
        )

      if (
        submittedHash !== currentHash
      ) {
        return jsonResponse(
          {
            error:
              'The current site password is incorrect.',
          },
          403,
        )
      }

      const newSalt =
        createRandomToken()

      const newHash =
        await sha256(
          newSalt + newPassword,
        )

      // Rotating this token immediately invalidates
      // every existing site-login cookie.
      const newAuthToken =
        createRandomToken()

      await db.batch([
        db
          .prepare(
            `INSERT INTO app_settings (key, value)
            VALUES ('site_password_salt', ?)
            ON CONFLICT(key)
            DO UPDATE SET value = excluded.value`,
          )
          .bind(newSalt),

        db
          .prepare(
            `INSERT INTO app_settings (key, value)
            VALUES ('site_password_hash', ?)
            ON CONFLICT(key)
            DO UPDATE SET value = excluded.value`,
          )
          .bind(newHash),

        db
          .prepare(
            `INSERT INTO app_settings (key, value)
            VALUES ('site_auth_token', ?)
            ON CONFLICT(key)
            DO UPDATE SET value = excluded.value`,
          )
          .bind(newAuthToken),
      ])

      return jsonResponse({
        ok: true,
      })
    }

    if (request.method === 'GET' && url.pathname === '/api/health') {
      const result = await db
        .prepare('SELECT COUNT(*) AS count FROM subjects')
        .first<{ count: number }>()

      return jsonResponse({
        ok: true,
        database: 'connected',
        subjectCount: result?.count ?? 0,
      })
    }

    if (request.method === 'GET' && url.pathname === '/api/subjects') {
      const result = await db
        .prepare('SELECT id, name FROM subjects ORDER BY name')
        .all<Subject>()

      return jsonResponse(result.results)
    }

    if (request.method === 'POST' && url.pathname === '/api/subjects') {
      const subject = (await request.json()) as Subject

      if (!subject.id || !subject.name.trim()) {
        return jsonResponse(
          { error: 'Subject id and name are required.' },
          400,
        )
      }

      await db
        .prepare('INSERT INTO subjects (id, name) VALUES (?, ?)')
        .bind(subject.id, subject.name.trim())
        .run()

      return jsonResponse(subject, 201)
    }

    if (
      request.method === 'DELETE' &&
      url.pathname.startsWith('/api/subjects/')
    ) {
      const id = decodeURIComponent(
        url.pathname.replace('/api/subjects/', ''),
      )

      await db
        .prepare('DELETE FROM subjects WHERE id = ?')
        .bind(id)
        .run()

      return jsonResponse({ ok: true })
    }

    if (request.method === 'GET' && url.pathname === '/api/periods') {
      const result = await db
        .prepare(
          `SELECT id, number, day, type, subject_id, color_name, accent, light, text_color
           FROM periods
           ORDER BY number`,
        )
        .all<any>()

      return jsonResponse(
        result.results.map(
          (p: any): Period => ({
            id: p.id,
            number: p.number,
            day: p.day,
            type: p.type,
            subjectId: p.subject_id,
            colorName: p.color_name,
            accent: p.accent,
            light: p.light,
            text: p.text_color,
          }),
        ),
      )
    }

    if (request.method === 'POST' && url.pathname === '/api/periods') {
      const p = (await request.json()) as Period

      await db
        .prepare(
          `INSERT INTO periods
           (id,number,day,type,subject_id,color_name,accent,light,text_color)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
        .bind(
          p.id,
          p.number,
          p.day,
          p.type,
          p.subjectId,
          p.colorName,
          p.accent,
          p.light,
          p.text,
        )
        .run()

      return jsonResponse(p, 201)
    }

    if (
      request.method === 'PUT' &&
      url.pathname.startsWith('/api/periods/')
    ) {
      const id = decodeURIComponent(
        url.pathname.replace('/api/periods/', ''),
      )
      const p = (await request.json()) as Period

      await db
        .prepare(
          `UPDATE periods
           SET number=?,day=?,type=?,subject_id=?,color_name=?,accent=?,light=?,text_color=?
           WHERE id=?`,
        )
        .bind(
          p.number,
          p.day,
          p.type,
          p.subjectId,
          p.colorName,
          p.accent,
          p.light,
          p.text,
          id,
        )
        .run()

      return jsonResponse(p)
    }

    if (request.method === 'GET' && url.pathname === '/api/lessons') {
      const result = await db
        .prepare(
          `SELECT id,subject_id,unit,code,name,learning_target,instructions,homework,warm_up
           FROM lessons
           ORDER BY name`,
        )
        .all<any>()

      return jsonResponse(
        result.results.map(
          (l: any): Lesson => ({
            id: l.id,
            subjectId: l.subject_id,
            unit: l.unit,
            code: l.code,
            name: l.name,
            learningTarget: l.learning_target,
            instructions: l.instructions,
            homework: l.homework,
            warmUp: l.warm_up,
          }),
        ),
      )
    }

    if (request.method === 'POST' && url.pathname === '/api/lessons') {
      const l = (await request.json()) as Lesson

      await db
        .prepare(
          `INSERT INTO lessons
           (id,subject_id,unit,code,name,learning_target,instructions,homework,warm_up)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
        .bind(
          l.id,
          l.subjectId,
          l.unit,
          l.code,
          l.name,
          l.learningTarget,
          l.instructions,
          l.homework,
          l.warmUp,
        )
        .run()

      return jsonResponse(l, 201)
    }

    if (
      request.method === 'PUT' &&
      url.pathname.startsWith('/api/lessons/')
    ) {
      const id = decodeURIComponent(
        url.pathname.replace('/api/lessons/', ''),
      )
      const l = (await request.json()) as Lesson

      await db
        .prepare(
          `UPDATE lessons
           SET subject_id=?,unit=?,code=?,name=?,learning_target=?,instructions=?,homework=?,warm_up=?
           WHERE id=?`,
        )
        .bind(
          l.subjectId,
          l.unit,
          l.code,
          l.name,
          l.learningTarget,
          l.instructions,
          l.homework,
          l.warmUp,
          id,
        )
        .run()

      return jsonResponse(l)
    }

    if (
      request.method === 'DELETE' &&
      url.pathname.startsWith('/api/lessons/')
    ) {
      const id = decodeURIComponent(
        url.pathname.replace('/api/lessons/', ''),
      )

      await db
        .prepare('DELETE FROM lessons WHERE id=?')
        .bind(id)
        .run()

      return jsonResponse({ ok: true })
    }

    if (
      request.method === 'GET' &&
      url.pathname === '/api/lesson-assignments'
    ) {
      const result = await db
        .prepare(
          'SELECT id,date,period_id,lesson_id FROM lesson_assignments ORDER BY date,period_id',
        )
        .all<any>()

      return jsonResponse(
        result.results.map(
          (a: any): LessonAssignment => ({
            id: a.id,
            date: a.date,
            periodId: a.period_id,
            lessonId: a.lesson_id,
          }),
        ),
      )
    }

    if (
      request.method === 'PUT' &&
      url.pathname === '/api/lesson-assignments'
    ) {
      const items = (await request.json()) as LessonAssignment[]

      await db.batch([
        db.prepare('DELETE FROM lesson_assignments'),
        ...items.map(a =>
          db
            .prepare(
              'INSERT INTO lesson_assignments (id,date,period_id,lesson_id) VALUES (?,?,?,?)',
            )
            .bind(a.id, a.date, a.periodId, a.lessonId),
        ),
      ])

      return jsonResponse(items)
    }

    if (request.method === 'GET' && url.pathname === '/api/school-days') {
      const result = await db
        .prepare(
          'SELECT date,day_type FROM school_days ORDER BY date',
        )
        .all<any>()

      return jsonResponse(
        result.results.map(
          (d: any): SchoolDay => ({
            date: d.date,
            dayType: d.day_type,
          }),
        ),
      )
    }

    if (
      request.method === 'PUT' &&
      url.pathname.startsWith('/api/school-days/')
    ) {
      const date = decodeURIComponent(
        url.pathname.replace('/api/school-days/', ''),
      )
      const d = (await request.json()) as SchoolDay

      await db
        .prepare(
          `INSERT INTO school_days (date,day_type)
           VALUES (?,?)
           ON CONFLICT(date) DO UPDATE SET day_type=excluded.day_type`,
        )
        .bind(date, d.dayType)
        .run()

      return jsonResponse({ ...d, date })
    }

    if (request.method === 'GET' && url.pathname === '/api/students') {
      const result = await db
        .prepare(
          'SELECT id,period_id,first_name,last_initial FROM students ORDER BY period_id,first_name,last_initial',
        )
        .all<any>()

      return jsonResponse(
        result.results.map(
          (s: any): Student => ({
            id: s.id,
            periodId: s.period_id,
            firstName: s.first_name,
            lastInitial: s.last_initial,
          }),
        ),
      )
    }

    if (request.method === 'POST' && url.pathname === '/api/students') {
      const s = (await request.json()) as Student

      await db
        .prepare(
          'INSERT INTO students (id,period_id,first_name,last_initial) VALUES (?,?,?,?)',
        )
        .bind(s.id, s.periodId, s.firstName, s.lastInitial)
        .run()

      return jsonResponse(s, 201)
    }

    if (
      request.method === 'DELETE' &&
      url.pathname.startsWith('/api/students/')
    ) {
      const id = decodeURIComponent(
        url.pathname.replace('/api/students/', ''),
      )

      await db
        .prepare('DELETE FROM students WHERE id=?')
        .bind(id)
        .run()

      return jsonResponse({ ok: true })
    }

    if (
      request.method === 'GET' &&
      url.pathname === '/api/forbidden-pairs'
    ) {
      const result = await db
        .prepare(
          'SELECT id,period_id,student_id_1,student_id_2 FROM forbidden_pairs ORDER BY period_id,id',
        )
        .all<any>()

      return jsonResponse(
        result.results.map(
          (p: any): ForbiddenPair => ({
            id: p.id,
            periodId: p.period_id,
            studentId1: p.student_id_1,
            studentId2: p.student_id_2,
          }),
        ),
      )
    }

    if (
      request.method === 'POST' &&
      url.pathname === '/api/forbidden-pairs'
    ) {
      const p = (await request.json()) as ForbiddenPair

      await db
        .prepare(
          'INSERT INTO forbidden_pairs (id,period_id,student_id_1,student_id_2) VALUES (?,?,?,?)',
        )
        .bind(
          p.id,
          p.periodId,
          p.studentId1,
          p.studentId2,
        )
        .run()

      return jsonResponse(p, 201)
    }

    if (
      request.method === 'DELETE' &&
      url.pathname.startsWith('/api/forbidden-pairs/')
    ) {
      const id = decodeURIComponent(
        url.pathname.replace('/api/forbidden-pairs/', ''),
      )

      await db
        .prepare('DELETE FROM forbidden_pairs WHERE id=?')
        .bind(id)
        .run()

      return jsonResponse({ ok: true })
    }

    if (
      request.method === 'GET' &&
      url.pathname === '/api/seating-charts'
    ) {
      const result = await db
        .prepare(
          `SELECT
            period_id,
            assignments,
            blocked_seat_ids,
            layout_mode,
            group_count,
            group_size
          FROM seating_charts
          ORDER BY period_id`,
        )
        .all<any>()

      const charts: SeatingChart[] =
        result.results.map(
          (c: any) => ({
            periodId: c.period_id,

            assignments: JSON.parse(
              c.assignments || '{}',
            ),

            blockedSeatIds: JSON.parse(
              c.blocked_seat_ids || '[]',
            ),

            layoutMode:
              c.layout_mode === 'groupSize'
                ? 'groupSize'
                : 'groupCount',

            groupCount:
              Number(c.group_count) || 9,

            groupSize:
              Number(c.group_size) || 4,
          }),
        )

      return jsonResponse(charts)
    }    

    if (
      request.method === 'PUT' &&
      url.pathname.startsWith(
        '/api/seating-charts/',
      )
    ) {
      const periodId = decodeURIComponent(
        url.pathname.replace(
          '/api/seating-charts/',
          '',
        ),
      )

      const c =
        (await request.json()) as SeatingChart

      const normalized: SeatingChart = {
        ...c,
        periodId,

        layoutMode:
          c.layoutMode === 'groupSize'
            ? 'groupSize'
            : 'groupCount',

        groupCount: Math.max(
          1,
          Math.floor(
            Number(c.groupCount) || 9,
          ),
        ),

        groupSize: Math.max(
          1,
          Math.floor(
            Number(c.groupSize) || 4,
          ),
        ),
      }

      await db
        .prepare(
          `INSERT INTO seating_charts
          (
            period_id,
            assignments,
            blocked_seat_ids,
            layout_mode,
            group_count,
            group_size
          )
          VALUES (?,?,?,?,?,?)
          ON CONFLICT(period_id)
          DO UPDATE SET
            assignments=excluded.assignments,
            blocked_seat_ids=excluded.blocked_seat_ids,
            layout_mode=excluded.layout_mode,
            group_count=excluded.group_count,
            group_size=excluded.group_size`,
        )
        .bind(
          periodId,
          JSON.stringify(
            normalized.assignments,
          ),
          JSON.stringify(
            normalized.blockedSeatIds,
          ),
          normalized.layoutMode,
          normalized.groupCount,
          normalized.groupSize,
        )
        .run()

      return jsonResponse(normalized)
    }

    // Authenticated requests that aren't API routes go to the React app.
    return env.ASSETS.fetch(request)
  },
}