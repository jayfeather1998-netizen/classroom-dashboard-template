# Classroom Dashboard

A classroom management and student display dashboard designed for teachers who want one place to organize daily lessons, seating charts, warm-ups, learning targets, homework, and classroom instructions.

The application runs in a web browser and uses Cloudflare Workers and Cloudflare D1 to store classroom data.

## Deploy Your Own Copy

Each deployment creates an independent copy of the dashboard connected to its own Cloudflare resources.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jayfeather1998-netizen/classroom-dashboard-template)

You will need:

- A free Cloudflare account
- A GitHub account
- A few minutes for the initial deployment

Your classroom information is stored in your own D1 database. It is not shared with other installations of the dashboard.

## Features

### Student Classroom Display

The student-facing dashboard provides a single-screen classroom display containing:

- Today's lesson
- Learning target
- When You Enter instructions
- Homework
- Warm-up
- Seating chart
- Current date and day of the week
- Class period selector

Each period has its own color theme so students can quickly identify the class being displayed.

### Lesson Library

Create reusable lessons containing:

- Lesson name
- Lesson code
- Unit
- Learning target
- Instructions
- Homework
- Warm-up

Lessons can be searched, sorted, filtered by subject or unit, and reused across multiple classes and dates.

### Lesson Calendar

The calendar allows you to:

- Mark dates as A Days, B Days, or No School
- Assign lessons to individual periods
- Give different periods different lessons
- Move lessons forward when your schedule changes
- Shift an entire instructional day forward
- Shift an individual period forward

### Seating Charts

Each class period has its own seating chart.

The seating system supports:

- Student roster management
- Bulk roster importing
- Randomized seating
- Manual student swaps
- Blocked/unavailable seats
- Forbidden student pairs
- Different numbers of groups
- Different group sizes

You can organize seating by either:

**Number of groups**

Example:

> 28 students → 7 groups → 4 seats per group

or:

**Students per group**

Example:

> 30 students → groups of 6 → 5 groups

The application automatically calculates the required seating capacity.

### Teacher Mode

Teacher Mode provides access to:

- Subjects
- Period configuration
- Lesson Library
- Lesson Calendar
- Student rosters
- Seating configuration
- Forbidden pairs

The student-facing display remains separate from these management tools.

## Initial Setup

After deploying your copy, open the dashboard and enter Teacher Mode.

The starter configuration includes:

### A Day

- Period 1
- Period 2
- Period 3
- Period 4

### B Day

- Period 6
- Period 7
- Period 8
- Period 9

These periods can be configured as classes or prep periods.

The starter subjects are:

- Math 8
- Algebra

You can add your own subjects and change the subject assigned to each period.

## Setting Up Your Classes

A recommended setup order is:

1. Open **Teacher Mode**.
2. Configure your subjects.
3. Configure each class period.
4. Open **Seating** and import your student rosters.
5. Configure the seating layout for each class.
6. Add lessons to the **Lesson Library**.
7. Open the **Lesson Calendar** and mark your school days.
8. Assign lessons to your classes.
9. Return to **Student Display**.

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

## Flexible Seating

Seating layouts are configured independently for each class period.

You can choose to control either the number of groups or the desired number of students per group.

The dashboard then calculates the other value based on the size of the roster.

Seats may also be blocked when a physical seat is unavailable.

Forbidden pairs can be created for students who should not be placed in the same group. The random seating generator will attempt to create a valid arrangement that respects those restrictions.

## Classroom Schedule

The dashboard uses an A/B schedule.

School days are explicitly selected on the Lesson Calendar rather than automatically alternating. This allows the calendar to handle holidays, professional-development days, weather closures, and other schedule interruptions without throwing off the rotation.

## Data Storage

Classroom data is stored using Cloudflare D1.

This includes:

- Subjects
- Period configuration
- Lessons
- Lesson assignments
- School-day configuration
- Student rosters
- Forbidden pairs
- Seating charts

Each person who deploys this template receives their own application and database resources through their Cloudflare account.

## Privacy and Security

This application was designed for classroom organizational information and intentionally minimizes student information stored in the database.

Student roster entries contain only:

- First name
- Last initial
- Class period

Do not use this application to store grades, student identification numbers, medical information, IEP information, disciplinary records, contact information, or other sensitive student records.

The built-in site password system is intended as a convenience barrier for a classroom dashboard. It should **not** be treated as strong authentication for sensitive or confidential information.

Schools and districts may have additional student-data, privacy, security, or technology requirements. Teachers should follow their organization's policies before using the application with student information.

## Technology

The dashboard is built with:

- React
- TypeScript
- Vite
- Cloudflare Workers
- Cloudflare D1

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
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

A fresh deployment applies the schema used by the application, including the flexible seating configuration.

## License

No license has currently been specified for this project.
      },
      // other options...
    },
  },
])

```
