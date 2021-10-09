import { dateRangeToTimestamp, getExistingGraphJSONTimestamps, HealthExportRow } from '../pages/api/import'
import * as graphjson from '../lib/graphjson'

test('Converts a date range string to a timestamp', () => {
  const dateRange = "2021-07-10 09:05:06 - 2021-07-10 10:10:43"
  const expected = 1625907906
  expect(dateRangeToTimestamp(dateRange)).toBe(expected)
})

const makeHealthExportRow = (dateRange: string): HealthExportRow => ({
  Date: dateRange,
  "Active energy burned(kcal)": 0,
  Activity: 'Running',
  "Distance(km)": 0,
  "Duration(s)": 0,
  "Heart rate zone: A Easy (<115bpm)(%)": 0,
  "Heart rate zone: B Fat Burn (115-135bpm)(%)": 0,
  "Heart rate zone: C Moderate Training (135-155bpm)(%)": 0,
   "Heart rate zone: D Hard Training (155-175bpm)(%)": 0,
   "Heart rate zone: E Extreme Training (>175bpm)(%)": 0,
   "Heart rate: Average(count/min)": 0,
   "Heart rate: Maximum(count/min)": 0,
   "METs Average(kcal/hr·kg)": 0
})

jest.mock('../lib/graphjson', () => ({
  getRunSamples: jest.fn().mockResolvedValue([{timestamp: 1234}, {timestamp: 4567}, {timestamp: 6789}])
}))

test('Gets the current timestamps from GraphJSON', async () => {

  const data: HealthExportRow[] = [
    makeHealthExportRow("2021-10-04 08:07:18 - 2021-10-04 08:40:04"),
    makeHealthExportRow("2021-10-07 08:20:09 - 2021-10-07 08:51:01"),
    makeHealthExportRow("2021-10-09 12:33:18 - 2021-10-09 13:23:38"),
  ]

  const apiKey = "apiKey"
  const projectRuns = "projectRuns"

  const timestamps = await getExistingGraphJSONTimestamps(data, apiKey, projectRuns)
  expect(timestamps).toStrictEqual(new Set([1234, 4567, 6789]))

  // Should have requested with correct start/end date derived from input
  expect(graphjson.getRunSamples).toHaveBeenCalledWith(apiKey, projectRuns, "2021-10-04T00:00:00.000+00:00", "2021-10-09T23:59:59.999+00:00")
})