import { ActivityEvent, dateRangeToTimestamp, getExistingGraphJSONTimestamps, HealthExportRow, toActivityEvent, toZoneEvents, ZoneEvent } from '../pages/api/import'
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
  'Elevation: Ascended(m)': null,
  'Elevation: Maximum(m)': null,
  'Elevation: Minimum(m)': null,
  "Heart rate zone: A Easy (<115bpm)(%)": 0,
  "Heart rate zone: B Fat Burn (115-135bpm)(%)": 0,
  "Heart rate zone: C Moderate Training (135-155bpm)(%)": 0,
  "Heart rate zone: D Hard Training (155-175bpm)(%)": 0,
  "Heart rate zone: E Extreme Training (>175bpm)(%)": 0,
  "Heart rate: Average(count/min)": 0,
  "Heart rate: Maximum(count/min)": 0,
  "METs Average(kcal/hr·kg)": 0,
  "Weather: Humidity(%)": null,
  "Weather: Temperature(degC)": null,
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

describe('toActivityEvent', () => {
  test('Converts a correctly parsed health export row', () => {
    const data: HealthExportRow = {
      Date: '2021-10-09 12:33:18 - 2021-10-09 13:23:38',
      'Active energy burned(kcal)': 584.462,
      Activity: 'Running',
      'Distance(km)': 8.16,
      'Duration(s)': 3020.2,
      'Elevation: Ascended(m)': 34.38,
      'Elevation: Maximum(m)': 45.912,
      'Elevation: Minimum(m)': 13.117,
      'Heart rate zone: A Easy (<115bpm)(%)': 0.002,
      'Heart rate zone: B Fat Burn (115-135bpm)(%)': 0,
      'Heart rate zone: C Moderate Training (135-155bpm)(%)': 0.091,
      'Heart rate zone: D Hard Training (155-175bpm)(%)': 0.907,
      'Heart rate zone: E Extreme Training (>175bpm)(%)': 0,
      'Heart rate: Average(count/min)': 163.78,
      'Heart rate: Maximum(count/min)': 172,
      'METs Average(kcal/hr·kg)': 11.522,
      'Weather: Humidity(%)': null,
      'Weather: Temperature(degC)': null
    }
    const project = 'projectRuns'
    const converted = toActivityEvent(data, project)
    const expected: ActivityEvent = {
      project,
      timestamp: 1633782798,
      kcal: 584.462,
      activity_type: 'Running',
      distance_km: 8.16,
      duration_mins_f: 50.3,
      pace_mins_per_km: 6.17,
      elevation_ascended_m: 34.38,
      elevation_maximum_m: 45.912,
      elevation_minimum_m: 13.117,
      heart_rate_a: 0.002,
      heart_rate_b: 0,
      heart_rate_c: 0.091,
      heart_rate_d: 0.907,
      heart_rate_e: 0,
      heart_rate_avg_rounded_i: 164,
      heart_rate_max: 172,
      mets_average: 11.522,
    }
    expect(converted).toStrictEqual(expected)
  })

  test('Converts a row with some missing data', () => {
    const data: HealthExportRow = {
      Date: '2021-09-25 16:54:59 - 2021-09-25 17:48:24',
      'Active energy burned(kcal)': 553.317,
      Activity: 'Running',
      'Distance(km)': 8.277,
      'Duration(s)': 3194.469,
      'Elevation: Ascended(m)': null,
      'Elevation: Maximum(m)': 45.596,
      'Elevation: Minimum(m)': 13.093,
      'Heart rate zone: A Easy (<115bpm)(%)': 0.006,
      'Heart rate zone: B Fat Burn (115-135bpm)(%)': 0.01,
      'Heart rate zone: C Moderate Training (135-155bpm)(%)': 0.351,
      'Heart rate zone: D Hard Training (155-175bpm)(%)': 0.633,
      'Heart rate zone: E Extreme Training (>175bpm)(%)': 0,
      'Heart rate: Average(count/min)': 156.54,
      'Heart rate: Maximum(count/min)': 169,
      'METs Average(kcal/hr·kg)': null,
      'Weather: Humidity(%)': null,
      'Weather: Temperature(degC)': null
    }
    const project = 'projectRuns'
    const converted = toActivityEvent(data, project)
    const expected: ActivityEvent = {
      project,
      timestamp: 1632588899,
      kcal: 553.317,
      activity_type: 'Running',
      distance_km: 8.277,
      duration_mins_f: 53.2,
      pace_mins_per_km: 6.43,
      elevation_ascended_m: 0,
      elevation_maximum_m: 45.596,
      elevation_minimum_m: 13.093,
      heart_rate_a: 0.006,
      heart_rate_b: 0.01,
      heart_rate_c: 0.351,
      heart_rate_d: 0.633,
      heart_rate_e: 0,
      heart_rate_avg_rounded_i: 157,
      heart_rate_max: 169,
      mets_average: 0,
    }
    expect(converted).toStrictEqual(expected)
  })
})

test('Convert an activity event to correct zone events', () => {
  const event: ActivityEvent = {
    project: 'callum_runs_dev',
    timestamp: 1633782798,
    kcal: 584.462,
    activity_type: 'Running',
    distance_km: 8.16,
    duration_mins_f: 50.3,
    pace_mins_per_km: 6.17,
    elevation_ascended_m: 34.38,
    elevation_maximum_m: 45.912,
    elevation_minimum_m: 13.117,
    heart_rate_a: 0.002,
    heart_rate_b: 0,
    heart_rate_c: 0.091,
    heart_rate_d: 0.907,
    heart_rate_e: 0,
    heart_rate_avg_rounded_i: 164,
    heart_rate_max: 172,
    mets_average: 11.522
  }
  const project = 'projectZones'
  const converted = toZoneEvents(event, project)
  const expected: ZoneEvent[] = [
    {
      project,
      timestamp: 1633782798,
      zone: 'Easy (A)',
      value: 0.2,
    },
    {
      project,
      timestamp: 1633782798,
      zone: 'Fat Burn (B)',
      value: 0,
    },
    {
      project,
      timestamp: 1633782798,
      zone: 'Build Fitness (C)',
      value: 9.1,
    },
    {
      project,
      timestamp: 1633782798,
      zone: 'Training (D)',
      value: 90.7,
    },
    {
      project,
      timestamp: 1633782798,
      zone: 'Extreme (E)',
      value: 0,
    },
  ]
  expect(converted).toStrictEqual(expected)
})
