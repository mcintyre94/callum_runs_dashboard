import { dateRangeToTimestamp } from '../pages/api/import'

test('Converts a date range string to a timestamp', () => {
  const dateRange = "2021-07-10 09:05:06 - 2021-07-10 10:10:43"
  const expected = 1625907906
  expect(dateRangeToTimestamp(dateRange)).toBe(expected)
})