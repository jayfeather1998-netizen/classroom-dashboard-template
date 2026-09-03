# Classroom Dashboard

A browser-based classroom management and student display dashboard for teachers who want one place to organize daily lessons, seating charts, warm-ups, learning targets, homework, classroom instructions, and class schedules.

The dashboard runs in a web browser and uses Cloudflare Workers and Cloudflare D1 to store classroom data. Each teacher who deploys the template receives their own independent application and database.

## Deploy Your Own Copy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jayfeather1998-netizen/classroom-dashboard-template)

You will need:

- A free Cloudflare account
- A GitHub account
- A few minutes for the initial deployment

Cloudflare will create your own copy of the application and its required database resources.

Your classroom information is stored in your own Cloudflare D1 database. It is not shared with other installations of the dashboard.

## Default Login Information

A new installation uses the following defaults:

**Website Password:** `classroom`

**Teacher PIN:** `1234`

After logging in, open **Teacher Mode → Setup** to change these.

It is recommended that you change both before beginning regular classroom use.

The **website password** controls access to the dashboard itself.

The **Teacher PIN** protects access to Teacher Mode and teacher-only actions from the student-facing display.

## Features

### Student Classroom Display

The student-facing dashboard provides a large, single-screen classroom display containing:

- Today's lesson
- Learning target
- When You Enter instructions
- Homework
- Warm-up
- Seating chart
- Current date and day of the week
- Class period selector

Each period can have its own color theme so students can quickly identify the class being displayed.

If the current date has not been configured as a school day, the display shows **No School** rather than selecting an inappropriate class period.

### Teacher Mode

Teacher Mode contains the management tools for the dashboard, including:

- Teacher Setup
- Lesson Library
- Lesson Calendar
- Student rosters
- Seating configuration
- Forbidden pairs

Teacher Mode is separated from the student-facing classroom display and is protected by the Teacher PIN.

### Teacher Setup

Teacher Setup allows you to configure:

- Subjects
- Class periods
- Class or prep periods
- Period colors
- Subjects assigned to periods
- Schedule type
- Number of periods
- Website password
- Teacher PIN

### Standard and Block Schedules

The dashboard supports both **Standard** and **Block** schedules.

#### Standard Schedule

For a standard schedule, choose how many period slots occur during a school day.

For example:

> 8 periods → Periods 0–7

Any unused period can be marked as **Prep** so it does not appear on the student classroom display.

#### Block Schedule

For a block schedule, choose how many period slots belong to the A Day and B Day schedules.

For example:

> 5 A-Day periods + 5 B-Day periods  
> A Day → Periods 0–4  
> B Day → Periods 5–9

Period slots are arranged chronologically. Individual periods can be configured as classes or prep periods.

Changing between Standard and Block schedules does not require recreating your lessons, rosters, or seating information.

### Lesson Library

Create reusable lessons containing:

- Lesson name
- Lesson code
- Unit
- Learning target
- Instructions
- Homework
- Warm-up

Lessons can be filtered by subject or unit and reused across multiple classes and dates.

The Lesson Library also supports importing lesson information from spreadsheet data.

### Lesson Calendar

The Lesson Calendar connects reusable lessons to actual instructional dates.

For a **Block Schedule**, dates can be marked as:

- A Day
- B Day
- No School

For a **Standard Schedule**, dates can be marked as:

- School Day
- No School

The calendar allows you to:

- Assign lessons to individual periods
- Give different periods different lessons
- Move lessons forward when the schedule changes
- Shift an entire instructional day forward
- Shift an individual period forward

The dashboard does not automatically alternate A and B days. School days are deliberately selected on the calendar so holidays, professional-development days, weather closures, and other interruptions do not throw off the schedule.

### Seating Charts

Each class period can have its own roster and seating chart.

The seating system supports:

- Student roster management
- Bulk roster importing
- Randomized seating
- Manual student swaps
- Blocked or unavailable seats
- Forbidden student pairs
- Different numbers of groups
- Different group sizes

Seating layouts can be organized by either **number of groups** or **students per group**.

#### Number of Groups

Example:

> 28 students → 7 groups → 4 seats per group

#### Students Per Group

Example:

> 30 students → groups of 6 → 5 groups

The dashboard automatically calculates the required seating capacity.

Blocked seats can be used when a physical seat is unavailable.

Forbidden pairs can be created for students who should not be placed in the same group. The random seating generator attempts to create a valid arrangement that respects those restrictions.

## Initial Setup

After deploying your copy:

1. Log in using the default website password: `classroom`.
2. Enter Teacher Mode using the default Teacher PIN: `1234`.
3. Open **Setup**.
4. Change your website password and Teacher PIN.
5. Choose **Standard** or **Block** schedule.
6. Configure the number of periods in your schedule.
7. Add or edit your subjects.
8. Configure each period as a class or prep period.
9. Assign subjects and colors to your class periods.
10. Open **Seating** and import your student rosters.
11. Configure the seating layout for each class.
12. Add lessons to the **Lesson Library**.
13. Open the **Lesson Calendar** and configure your school days.
14. Assign lessons to your classes.
15. Open **Display Mode**.

## Importing a Roster

The roster importer accepts names in this format:

```text
Last, First
Last, First
Last, First
```

For example:

```text
Smith, Jordan
Garcia, Maya
Johnson, Alex
```

The dashboard converts these to student-display names such as:

```text
Jordan S.
Maya G.
Alex J.
```

Only the student's first name and last initial are stored by the dashboard.

## Updating Your Dashboard

The dashboard includes a manual **Update Dashboard** workflow through GitHub.

This allows you to choose when to install newer versions of the classroom dashboard without replacing your classroom database.

To update:

1. Open your classroom dashboard repository on GitHub.
2. Select **Actions**.
3. Select **Update Dashboard**.
4. Select **Run workflow**.
5. Confirm **Run workflow**.

The updater retrieves the newest application code from the main Classroom Dashboard template while preserving your installation-specific Cloudflare configuration.

Cloudflare will then automatically build and deploy the updated dashboard.

Your existing D1 database remains connected, so normal dashboard data such as lessons, rosters, schedules, and seating charts is preserved.

When an update includes a database change, numbered D1 migrations are used to update the existing database rather than replacing it.

### Older Installations

Older installations created before the **Update Dashboard** workflow was added may require the updater to be installed once manually.

After that one-time setup, future updates can be installed using **Actions → Update Dashboard → Run workflow**.

## Data Storage

Classroom data is stored in your installation's Cloudflare D1 database.

This includes:

- Subjects
- Period configuration
- Schedule settings
- Lessons
- Lesson assignments
- School-day configuration
- Student rosters
- Forbidden pairs
- Seating charts
- Dashboard settings

Updating the application code does not intentionally replace this classroom data.

## Privacy and Security

This application was designed for classroom organizational information and intentionally minimizes the student information stored in the database.

Student roster entries contain only:

- First name
- Last initial
- Class period

Do not use this application to store grades, student identification numbers, medical information, IEP information, disciplinary records, contact information, or other sensitive student records.

The built-in website password and Teacher PIN are intended as access barriers for a classroom dashboard. They should **not** be treated as strong authentication suitable for highly sensitive or confidential information.

Schools and districts may have additional student-data, privacy, security, or technology requirements. Teachers should follow their organization's policies before using the application with student information.

## Technology

The dashboard is built with:

- React
- TypeScript
- Vite
- Cloudflare Workers
- Cloudflare D1

Normal users do not need to install these tools. The **Deploy to Cloudflare** process allows the dashboard to be installed using a web browser.

## Local Development

Local development is only necessary if you intend to modify the dashboard's source code.

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Start the local Cloudflare Worker and D1 environment in another terminal:

```bash
npx wrangler dev
```

Build the application:

```bash
npm run build
```

Apply D1 migrations:

```bash
npm run db:migrations:apply
```

Deploy:

```bash
npm run deploy
```

## Database Migrations

Database migrations are stored in:

```text
migrations/
```

New database changes are added as new numbered migration files. Existing migration files should not be modified after release because existing dashboard installations use the migration history to determine which database changes still need to be applied.

## License

No license has currently been specified for this project.