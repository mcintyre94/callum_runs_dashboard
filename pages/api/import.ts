import type { NextApiRequest, NextApiResponse } from 'next'
import Papa from 'papaparse'

type HealthExportRow = {
  Date: string // eg. 2021-10-04 08:07:18 - 2021-10-04 08:40:04
  'Active energy burned(kcal)': number // eg. 364.671
  Activity: string // eg. Running
  'Distance(km)': number // eg. 5.202
  'Duration(s)': number // eg. 1966.157
  'Elevation: Ascended(m)': number // eg. 36.58
  'Elevation: Maximum(m)': number // eg. 45.724
  'Elevation: Minimum(m)': number // eg. 13.158
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

type Data = {
  name: string
}

export default (req: NextApiRequest, res: NextApiResponse<Data | Papa.ParseError[]>) => {
  const csvData: string = req.body.csvData;
  const { data, errors } = Papa.parse<HealthExportRow>(csvData, {
    header: true,
    dynamicTyping: true,
  });

  if(errors.length > 0) {
    res.status(400).json(errors)
  }

  console.log(data)
}