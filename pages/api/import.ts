import type { NextApiRequest, NextApiResponse } from 'next'
import { DateTime } from 'luxon'
import Papa from 'papaparse'
import { Decimal } from 'decimal.js-light'
import { getGraphJSONApiKey, getGraphJSONCollectionRuns, getGraphJSONCollectionZones, getImportApiKey } from '../../lib/env';
import { getRunSamples, logEvent } from '../../lib/graphjson'
import type { ActivityEvent, GraphJSONEvent, ZoneEvent } from '../../lib/event';
import formidable from "formidable";


// This maps to the HealthExport CSV file, hence the terrible field names!
export type HealthExportRow = {
  Date: string // eg. 2021-10-04 08:07:18 - 2021-10-04 08:40:04
  'Active energy burned(kcal)': number | null // eg. 364.671
  Activity: string // eg. Running
  'Distance(km)': number // eg. 5.202
  'Duration(s)': number // eg. 1966.157
  'Elevation: Ascended(m)': number | null // eg. 36.58
  'Elevation: Maximum(m)': number | null // eg. 45.724
  'Elevation: Minimum(m)': number | null // eg. 13.158
  'Heart rate zone: A Easy (<115bpm)(%)': number | null // eg. 0
  'Heart rate zone: B Fat Burn (115-135bpm)(%)': number | null // eg. 0.01
  'Heart rate zone: C Moderate Training (135-155bpm)(%)': number | null // eg. 0.129
  'Heart rate zone: D Hard Training (155-175bpm)(%)': number | null // eg. 0.861
  'Heart rate zone: E Extreme Training (>175bpm)(%)': number | null // eg. 0
  'Heart rate: Average(count/min)': number | null // eg. 160.121
  'Heart rate: Maximum(count/min)': number | null // eg. 169
  'METs Average(kcal/hr·kg)': number | null // eg. 11.289
  'Weather: Humidity(%)': number | null // eg. 93, but always null for runs for some reason
  'Weather: Temperature(degC)': number | null // eg. 11, but always null for runs for some reason
}

type OutputData = {
  loggedCount: number
  filteredTimestampsCount: number
}

type OutputError = {
  error: string
}

/**
 * Get the start date as a UTC Date
 * @param dateRange Start + end date, eg. "2021-07-10 09:05:06 - 2021-07-10 10:10:43"
 * @returns A date with the UTC equivalent
 */
const getStartDateUTC = (dateRange: string): DateTime => {
  const startDate = dateRange.split(" - ")[0]
  return DateTime.fromSQL(startDate, {zone: "Etc/UTC"})
}

/**
 * Get the timestamps of runs that are already logged, to be used for de-duping
 * @param data Rows of health export data
 * @param graphJSONApiKey API key for GraphJSON
 * @param graphJSONCollectionRuns Collection used in GraphJSON to record runs
 * @returns The set of timestamps already recorded
 */
export const getExistingGraphJSONTimestamps = async (data: HealthExportRow[], graphJSONApiKey: string, graphJSONCollectionRuns: string): Promise<Set<number>> => {
  // Get a date before the first activity + after the last
  const earliestStartDate = getStartDateUTC(data[0].Date).startOf("day").toISO()
  const latestStartDate = getStartDateUTC(data[data.length-1].Date).endOf("day").toISO()
  // Query GraphJSON for data between those dates
  const samples = await getRunSamples(graphJSONApiKey, graphJSONCollectionRuns, earliestStartDate, latestStartDate)
  return new Set(samples.map(s => s.timestamp))
}

/**
 * Parse a timestamp from the start date of a date range
 * @param dateRange Start + end date, eg. "2021-07-10 09:05:06 - 2021-07-10 10:10:43"
 * @returns Timestamp, eg. 1625907906
 */
export const dateRangeToTimestamp = (dateRange: string): number => {
  const startDate = getStartDateUTC(dateRange)
  return startDate.toSeconds()
}

/**
 * Convert a health export row to an activity event
 * @param row Health Export row describing a single activity
 * @param graphJSONCollectionRuns GraphJSON runs collection
 * @returns Activity event object to upload to GraphJSON
 */
export const toActivityEvent = (row: HealthExportRow, graphJSONCollectionRuns: string):  ActivityEvent => {
  const timestamp = dateRangeToTimestamp(row.Date)
  const durationMins = new Decimal(row['Duration(s)']).dividedBy(60)
  const paceMinsPerKm = durationMins.dividedBy(row['Distance(km)']).toDecimalPlaces(2).toNumber()

  if(row['Heart rate: Average(count/min)'] === null) {
    row['Heart rate: Average(count/min)'] = 0
  }

  return {
    collection: graphJSONCollectionRuns,
    // TODO: can remove this when we move fully to collections
    project: graphJSONCollectionRuns,
    timestamp,
    kcal: row['Active energy burned(kcal)'],
    activity_type: row.Activity,
    distance_km: row['Distance(km)'],
    duration_mins_f: durationMins.toDecimalPlaces(1).toNumber(),
    pace_mins_per_km: paceMinsPerKm,
    elevation_ascended_m: row['Elevation: Ascended(m)'] ?? 0,
    elevation_maximum_m: row['Elevation: Maximum(m)'] ?? 0,
    elevation_minimum_m: row['Elevation: Minimum(m)'] ?? 0,
    heart_rate_a: row['Heart rate zone: A Easy (<115bpm)(%)'],
    heart_rate_b: row['Heart rate zone: B Fat Burn (115-135bpm)(%)'],
    heart_rate_c: row['Heart rate zone: C Moderate Training (135-155bpm)(%)'],
    heart_rate_d: row['Heart rate zone: D Hard Training (155-175bpm)(%)'],
    heart_rate_e: row['Heart rate zone: E Extreme Training (>175bpm)(%)'],
    heart_rate_avg_rounded_i: new Decimal(row['Heart rate: Average(count/min)']).toInteger().toNumber(),
    heart_rate_max: row['Heart rate: Maximum(count/min)'],
    mets_average: row['METs Average(kcal/hr·kg)'] ?? 0,
  }
}

const convertToPercentage = (zoneValue: number | null): number => {
  if(zoneValue === null) {
    return 0
  }
  new Decimal(zoneValue).times(100).toDecimalPlaces(1).toNumber()
}

export const toZoneEvents = (event: ActivityEvent, graphJSONCollectionZones: string): ZoneEvent[] => [
  {
    collection: graphJSONCollectionZones,
    project: graphJSONCollectionZones,
    timestamp: event.timestamp,
    zone: 'Easy (A)',
    value: convertToPercentage(event.heart_rate_a),
  },
  {
    collection: graphJSONCollectionZones,
    project: graphJSONCollectionZones,
    timestamp: event.timestamp,
    zone: 'Fat Burn (B)',
    value: convertToPercentage(event.heart_rate_b),
  },
  {
    collection: graphJSONCollectionZones,
    project: graphJSONCollectionZones,
    timestamp: event.timestamp,
    zone: 'Build Fitness (C)',
    value: convertToPercentage(event.heart_rate_c),
  },
  {
    collection: graphJSONCollectionZones,
    project: graphJSONCollectionZones,
    timestamp: event.timestamp,
    zone: 'Training (D)',
    value: convertToPercentage(event.heart_rate_d),
  },
  {
    collection: graphJSONCollectionZones,
    project: graphJSONCollectionZones,
    timestamp: event.timestamp,
    zone: 'Extreme (E)',
    value: convertToPercentage(event.heart_rate_e),
  },
]

async function parseForm(req: NextApiRequest): Promise<string> {
  console.log("req.body", req.body)

  const form = formidable()
  const csvData: string = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, _files) {
      if(err) {
        reject(err)
        return
      }
      console.log("fields", fields);
      resolve(fields.csvData as string)
    })
  })
  return csvData
}

async function handler(req: NextApiRequest, res: NextApiResponse<OutputData | Papa.ParseError[] | OutputError>) {
  const expectedImportApiKey = getImportApiKey()
  const importApiKeyHeader = req.headers['api-key']
  if(importApiKeyHeader != expectedImportApiKey) {
    return res.status(401).json({"error": "Missing or incorrect api-key"})
  }

  const graphJSONApiKey = getGraphJSONApiKey()
  const graphJSONCollectionRuns = getGraphJSONCollectionRuns()
  const graphJSONCollectionZones = getGraphJSONCollectionZones()

  const csvData = await parseForm(req)
  console.log("csvData", csvData);

  const { data, errors } = Papa.parse<HealthExportRow>(csvData, {
    header: true,
    dynamicTyping: true,
  });

  console.log("data", data)
  console.log("errors", errors) 

  if(errors.length > 0) {
    return res.status(400).json(errors)
  }

  const runsData = data.filter(d => d.Activity == 'Running');

  console.log("runsData", runsData);

  const existingTimestamps = await getExistingGraphJSONTimestamps(runsData, graphJSONApiKey, graphJSONCollectionRuns)
  console.log('existingTimestamps', existingTimestamps)

  const eventsToLog: GraphJSONEvent[] = runsData.flatMap(data => {
    const activityEvent = toActivityEvent(data, graphJSONCollectionRuns)
    if(existingTimestamps.has(activityEvent.timestamp)) {
      return [] // don't generate any events when it matches an existing timestamp
    } else {
      const zoneEvents = [] // toZoneEvents(activityEvent, graphJSONCollectionZones)
      return [activityEvent, ...zoneEvents]
    }
  })

  // for(const event of eventsToLog) await logEvent(event, graphJSONApiKey)

  console.log(eventsToLog);

  const response: OutputData = {
    loggedCount: eventsToLog.length,
    filteredTimestampsCount: existingTimestamps.size,
  }

  console.log('Response', response)
  return res.status(200).json(response)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler