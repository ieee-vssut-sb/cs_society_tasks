import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc) 
dayjs.extend(timezone)

export function getLocalTime(tz) {
  return dayjs().tz(tz).format('h:mm A')
}

export function getTimezoneOffsetHours(tz) {
  return dayjs().tz(tz).utcOffset() / 60
}

export function getTimezoneDifference(tz1, tz2) {
  const offset1 = getTimezoneOffsetHours(tz1)
  const offset2 = getTimezoneOffsetHours(tz2)
  const diffHours = Math.abs(offset2 - offset1)

  let description
  if (diffHours === 0) {
    description = 'Same timezone — no time difference'
  } else {
    const ahead = offset2 > offset1 ? 'Friend 2' : 'Friend 1'
    const hours = diffHours % 1 === 0 ? diffHours : diffHours.toFixed(1)
    description = `${ahead} is ${hours} hour${hours === 1 ? '' : 's'} ahead`
  } // If the time difference is not 0, calculate the time difference

  return {
    diffHours,
    offset1,
    offset2,
    description,
    friend1Time: getLocalTime(tz1),
    friend2Time: getLocalTime(tz2),
  }
} 
