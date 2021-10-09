import type { NextApiRequest, NextApiResponse } from 'next'
import Papa from 'papaparse'

// This maps to the HealthExport CSV file, hence the terrible field names!
type HealthExportRow = {
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

/**
 * Parse a timestamp from the start date of a date range
 * @param dateRangeString Start + end date, eg. "2021-07-10 09:05:06 - 2021-07-10 10:10:43"
 * @returns Timestamp, eg. 1625907906
 */
export const dateRangeToTimestamp = (dateRangeString: string): number => {
  const startDate = dateRangeString.split(" - ")[0]
  const date = new Date(startDate)
  const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
  return dateUTC.getTime() / 1000
}

export default function Import(req: NextApiRequest, res: NextApiResponse<OutputData | Papa.ParseError[]>) {
  const csvData: string = req.body.csvData;
  const { data, errors } = Papa.parse<HealthExportRow>(csvData, {
    header: true,
    dynamicTyping: true,
  });

  if(errors.length > 0) {
    res.status(400).json(errors)
  }

  const runsData = data.filter(d => d.Activity == 'Running');
  console.log(runsData)

  return res.status(200).json({eventsLogged: 6})
}
