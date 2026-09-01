export type SeatingGroup = {
  groupNumber: number
  name: string
  color: string
  light: string
}

const seatingGroupColors = [
  {
    name: 'Red',
    color: '#e74c3c',
    light: '#fbe4e1',
  },
  {
    name: 'Orange',
    color: '#f39c12',
    light: '#fdf0dc',
  },
  {
    name: 'Yellow',
    color: '#f1c40f',
    light: '#fdf7d7',
  },
  {
    name: 'Green',
    color: '#2ecc71',
    light: '#e0f7e9',
  },
  {
    name: 'Teal',
    color: '#1abc9c',
    light: '#ddf6f1',
  },
  {
    name: 'Blue',
    color: '#3498db',
    light: '#e1f0fa',
  },
  {
    name: 'Purple',
    color: '#9b59b6',
    light: '#efe3f4',
  },
  {
    name: 'Pink',
    color: '#e91e63',
    light: '#fbe0e9',
  },
  {
    name: 'Brown',
    color: '#8d6e63',
    light: '#eee7e4',
  },
]

export function createSeatingGroups(
  groupCount: number,
): SeatingGroup[] {
  const safeGroupCount = Math.max(
    1,
    Math.floor(groupCount),
  )

  return Array.from(
    { length: safeGroupCount },
    (_, index) => {
      const groupNumber = index + 1

      const color =
        seatingGroupColors[
          index % seatingGroupColors.length
        ]

      return {
        groupNumber,
        name: color.name,
        color: color.color,
        light: color.light,
      }
    },
  )
}

export function createSeatIds(
  groupCount: number,
  groupSize: number,
): string[] {
  const safeGroupCount = Math.max(
    1,
    Math.floor(groupCount),
  )

  const safeGroupSize = Math.max(
    1,
    Math.floor(groupSize),
  )

  const seatIds: string[] = []

  for (
    let groupNumber = 1;
    groupNumber <= safeGroupCount;
    groupNumber++
  ) {
    for (
      let position = 1;
      position <= safeGroupSize;
      position++
    ) {
      seatIds.push(
        `g${groupNumber}-s${position}`,
      )
    }
  }

  return seatIds
}

export function calculateSeatingLayout(
  studentCount: number,
  layoutMode: 'groupCount' | 'groupSize',
  groupCount: number,
  groupSize: number,
) {
  const safeStudentCount = Math.max(
    0,
    studentCount,
  )

  if (layoutMode === 'groupSize') {
    const safeGroupSize = Math.max(
      1,
      Math.floor(groupSize),
    )

    const calculatedGroupCount = Math.max(
      1,
      Math.ceil(
        safeStudentCount / safeGroupSize,
      ),
    )

    return {
      groupCount: calculatedGroupCount,
      groupSize: safeGroupSize,
    }
  }

  const safeGroupCount = Math.max(
    1,
    Math.floor(groupCount),
  )

  const calculatedGroupSize = Math.max(
    1,
    Math.ceil(
      safeStudentCount / safeGroupCount,
    ),
  )

  return {
    groupCount: safeGroupCount,
    groupSize: calculatedGroupSize,
  }
}

// Temporary compatibility export.
//
// Existing parts of the app still expect seatingGroups
// while we convert the seating system to dynamic layouts.
export const seatingGroups =
  createSeatingGroups(9)