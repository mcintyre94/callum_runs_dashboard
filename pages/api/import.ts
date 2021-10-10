import type { NextApiRequest, NextApiResponse } from 'next'
import { DateTime } from 'luxon'
import Papa from 'papaparse'
import { getGraphJSONApiKey, getGraphJSONProjectRuns, getGraphJSONProjectZones, getImportApiKey } from '../../lib/env';
import { getRunSamples } from '../../lib/graphjson'

// This maps to the HealthExport CSV file, hence the terrible field names!
export type HealthExportRow = {
  Date: string // eg. 2021-10-04 08:07:18 - 2021-10-04 08:40:04
  'Active energy burned(kcal)': number // eg. 364.671
  Activity: string // eg. Running
  'Distance(km)': number // eg. 5.202
  'Duration(s)': number // eg. 1966.157
  'Elevation: Ascended(m)'?: number // eg. 36.58
  'Elevation: Maximum(m)'?: number // eg. 45.724
  'Elevation: Minimum(m)'?: number // eg. 13.158
  'Heart rate zone: A Easy (<115bpm)(%)': number // eg. 0
  'Heart rate zone: B Fat Burn (115-135bpm)(%)': number // eg. 0.01
  'Heart rate zone: C Moderate Training (135-155bpm)(%)': number // eg. 0.129
  'Heart rate zone: D Hard Training (155-175bpm)(%)': number // eg. 0.861
  'Heart rate zone: E Extreme Training (>175bpm)(%)': number // eg. 0
  'Heart rate: Average(count/min)': number // eg. 160.121
  'Heart rate: Maximum(count/min)': number // eg. 169
  'METs Average(kcal/hr·kg)': number // eg. 11.289
  'Weather: Humidity(%)'?: number // eg. 93, but always null for runs for some reason
  'Weather: Temperature(degC)'?: number // eg. 11, but always null for runs for some reason
}

type OutputData = {
  eventsLogged: number
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
  return DateTime.fromSQL(startDate, {zone: "ETC/UTC"})
}

export const getExistingGraphJSONTimestamps = async (data: HealthExportRow[], graphJSONApiKey: string, graphJSONProjectRuns: string): Promise<Set<number>> => {
  const earliestStartDate = getStartDateUTC(data[0].Date).startOf("day").toISO()
  const latestStartDate = getStartDateUTC(data[data.length-1].Date).endOf("day").toISO()
  const samples = await getRunSamples(graphJSONApiKey, graphJSONProjectRuns, earliestStartDate, latestStartDate)
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



export default async function Import(req: NextApiRequest, res: NextApiResponse<OutputData | Papa.ParseError[] | OutputError>) {
  const expectedImportApiKey = getImportApiKey()
  const importApiKeyHeader = req.headers['api-key']
  if(importApiKeyHeader != expectedImportApiKey) {
    return res.status(401).json({"error": "Missing or incorrect api-key"})
  }

  const graphJSONApiKey = getGraphJSONApiKey()
  const graphJSONProjectRuns = getGraphJSONProjectRuns()
  // const graphJSONProjectZones = getGraphJSONProjectZones()

  const csvData: string = req.body.csvData;
  const { data, errors } = Papa.parse<HealthExportRow>(csvData, {
    header: true,
    dynamicTyping: true,
  });

  if(errors.length > 0) {
    return res.status(400).json(errors)
  }

  const runsData = data.filter(d => d.Activity == 'Running');
  console.log(runsData)

  const existingTimestamps = await getExistingGraphJSONTimestamps(runsData, graphJSONApiKey, graphJSONProjectRuns)
  console.log(existingTimestamps)

  // TODO: Translate runsData into graphJSON import data
  // TODO: Filter out existingTimestamps

  return res.status(200).json({eventsLogged: 0})
}
