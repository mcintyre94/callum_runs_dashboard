import type { GraphJSONEvent } from "./event"
import { DateTime } from "luxon"

enum LineColour {
  Distance = '#0345fc',
  Duration = '#036648',
  Pace = '#ec8d09',
  HeartRate = '#ba040d',
  Score = '#a809f1',
}

enum Metric {
  DistanceKm = 'distance_km',
  DurationsMins = 'duration_mins_f',
  PaceMinsPerKm = 'pace_mins_per_km',
  HeartRateBpm = 'heart_rate_avg_rounded_i',
  Score = 'score',
  ZoneValue = 'value',
  Zone = 'zone',
}

enum MetricLabel {
  Distance = 'Distance',
  Duration = 'Duration',
  Pace = 'Pace',
  Score = 'Score',
  HeartRate = 'Heart Rate',
  Proportion = 'Proportion',
}

enum GraphType {
  CumulativeLine = 'Cumulative Line',
  SingleLine = 'Single Line',
  StackedLine = 'Stacked Line',
  Samples = 'Samples',
}

enum Aggregation {
  Sum = 'Sum',
  Avg = 'Avg',
}

export enum Time {
  OneMonthAgo = '1 month ago',
  Now = 'now',
  // Start2020 = '01/01/2020 0:00 am',
  Start2021 = '01/01/2021 0:00 am',
  StartJuly2021 = '07/01/2021 0:00 am',
}

const startOfMonth = DateTime.local().startOf('month').toString();

const nonZeroFilter = (metric: Metric): GraphJSONFilter => (
  [metric.toString(), ">", "0"]
);

enum Granularity {
  Day = 'Day',
  Week = 'Week',
}

enum Timezone {
  London = 'Europe/London',
  UTC = 'Etc/UTC',
}

enum ComparisonLabel {
  LastMonth = 'Last Month',
}

enum Suffix {
  Km = 'km',
  Mins = 'mins',
  MinsPerKm = 'mins/km',
  Bpm = 'bpm',
  Percent = '%',
}

type GraphJSONCustomizations = {
  lineColor?: LineColour
  hideMissing: boolean,
  hideSummary: boolean,
  hideToolTip: boolean,
  showDots: boolean,
  hideXAxis: boolean,
  showYAxis: boolean,
  title: string,
  metric: MetricLabel,
  comparison?: ComparisonLabel,
  value_suffix?: Suffix
}

type GraphJSONFilter = [string, string, string]

type GraphJSONPayload = {
  api_key: string,
  collection: string,
  IANA_time_zone: string,
  graph_type: GraphType,
  start: Time | typeof startOfMonth,
  end: Time,
  compare?: Time,
  filters: GraphJSONFilter[],
  metric: Metric,
  aggregation: Aggregation,
  granularity: Granularity,
  split?: Metric,
  customizations: GraphJSONCustomizations
}

type GraphJSONSamplePayload = {
  api_key: string,
  collection: string,
  IANA_time_zone: string,
  graph_type: GraphType,
  start: string,
  end: string,
  filters: GraphJSONFilter[],
  customizations: {}
}

type GraphJSONEventPayload = {
  api_key: string,
  collection: string,
  timestamp: number,
  json: string,
}

type GraphJSONVisualiseIframeResponse = {
  url: string
}

type GraphJSONDataResponse = {
  result: [
    {
      json: Object,
      timestamp: number
    }
  ]
}

// Note: Can remove this when I have data imported into collections
const projectFilter = (project: string): GraphJSONFilter =>
  ["project", "=", project]

const requestIframeURL = async (payload: GraphJSONPayload) => {
  const response = await fetch('https://www.graphjson.com/api/visualize/iframe', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  const jsonResponse: GraphJSONVisualiseIframeResponse = await response.json();
  return jsonResponse.url
}

const requestData = async (payload: GraphJSONSamplePayload): Promise<GraphJSONDataResponse> => {
  const response = await fetch('https://www.graphjson.com/api/visualize/data', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  const jsonResponse: GraphJSONDataResponse = await response.json()
  return jsonResponse
}

export const makeCumulativeDistanceMonthIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.CumulativeLine,
    start: startOfMonth,
    end: Time.Now,
    compare: Time.OneMonthAgo,
    filters: [],
    metric: Metric.DistanceKm,
    aggregation: Aggregation.Sum,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.Distance,
      hideMissing: false,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Distance (km) this month',
      metric: MetricLabel.Distance,
      comparison: ComparisonLabel.LastMonth,
      value_suffix: Suffix.Km,
    }
  }

  return requestIframeURL(payload)
}

export const makeCumulativeDurationMonthIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.CumulativeLine,
    start: startOfMonth,
    end: Time.Now,
    compare: Time.OneMonthAgo,
    filters: [],
    metric: Metric.DurationsMins,
    aggregation: Aggregation.Sum,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.Duration,
      hideMissing: false,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Duration (mins) this month',
      metric: MetricLabel.Duration,
      comparison: ComparisonLabel.LastMonth,
      value_suffix: Suffix.Mins
    }
  }

  return requestIframeURL(payload);
}

export const makeHeartRateZonesMonthIframeURL = async (apiKey: string, zonesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: zonesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.StackedLine,
    start: startOfMonth,
    end: Time.Now,
    filters: [nonZeroFilter(Metric.ZoneValue)],
    metric: Metric.ZoneValue,
    aggregation: Aggregation.Avg,
    granularity: Granularity.Day,
    split: Metric.Zone,
    customizations: {
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: false,
      title: 'Heart Rate Zones this month',
      metric: MetricLabel.Proportion,
      value_suffix: Suffix.Percent,
    }
  }

  return requestIframeURL(payload);
}

export const makeDistanceOverTimeIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2021,
    end: Time.Now,
    filters: [],
    metric: Metric.DistanceKm,
    aggregation: Aggregation.Sum,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.Distance,
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Distance (km)',
      metric: MetricLabel.Distance,
      value_suffix: Suffix.Km,
    }
  }

  return requestIframeURL(payload);
}

export const makeDurationOverTimeIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2021,
    end: Time.Now,
    filters: [],
    metric: Metric.DurationsMins,
    aggregation: Aggregation.Sum,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.Duration,
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Duration (mins)',
      metric: MetricLabel.Duration,
      value_suffix: Suffix.Mins,
    }
  }

  return requestIframeURL(payload);
}

export const makePaceOverTimeIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2021,
    end: Time.Now,
    filters: [],
    metric: Metric.PaceMinsPerKm,
    aggregation: Aggregation.Avg,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.Pace,
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Pace (Avg, lower is faster)',
      metric: MetricLabel.Pace,
      value_suffix: Suffix.MinsPerKm,
    }
  }

  return requestIframeURL(payload);
}

export const makeHeartRateOverTimeIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2021,
    end: Time.Now,
    filters: [nonZeroFilter(Metric.HeartRateBpm)],
    metric: Metric.HeartRateBpm,
    aggregation: Aggregation.Avg,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.HeartRate,
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Heart Rate (avg)',
      metric: MetricLabel.HeartRate,
      value_suffix: Suffix.Bpm
    }
  }

  return requestIframeURL(payload);
}

export const makeHeartRateZonesOverTimeIframeURL = async (apiKey: string, zonesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: zonesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.StackedLine,
    start: Time.Start2021,
    end: Time.Now,
    filters: [nonZeroFilter(Metric.ZoneValue)],
    metric: Metric.ZoneValue,
    aggregation: Aggregation.Avg,
    granularity: Granularity.Day,
    split: Metric.Zone,
    customizations: {
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: false,
      title: 'Heart Rate Zones',
      metric: MetricLabel.Proportion,
      value_suffix: Suffix.Percent,
    }
  }

  return requestIframeURL(payload);
}

export const makeCumulativeDistanceOverTimeIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.CumulativeLine,
    start: Time.StartJuly2021,
    end: Time.Now,
    filters: [],
    metric: Metric.DistanceKm,
    aggregation: Aggregation.Sum,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.Distance,
      hideMissing: false,
      hideSummary: false,
      hideToolTip: false,
      showDots: false,
      hideXAxis: false,
      showYAxis: true,
      title: 'Total Distance In Streak',
      metric: MetricLabel.Distance,
      value_suffix: Suffix.Km,
    }
  }

  return requestIframeURL(payload);
}

export const makeAverageScoreOverTimeIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2021,
    end: Time.Now,
    filters: [],
    metric: Metric.Score,
    aggregation: Aggregation.Avg,
    granularity: Granularity.Week,
    customizations: {
      lineColor: LineColour.Score,
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Average Score',
      metric: MetricLabel.Score,
    }
  }

  return requestIframeURL(payload);
}

export type RunSample = {
  timestamp: number
  json: Object
}

export const getRunSamples = async (apiKey: string, activitiesCollection: string, startDate: string, endDate: string): Promise<RunSample[]> => {
  const payload: GraphJSONSamplePayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.UTC,
    graph_type: GraphType.Samples,
    start: startDate,
    end: endDate,
    filters: [],
    customizations: {},
  }

  const graphJSONData = await requestData(payload)
  return graphJSONData.result
}

export const logEvent = async (event: GraphJSONEvent, apiKey: string): Promise<void> => {
  const payload: GraphJSONEventPayload = {
    api_key: apiKey,
    collection: event.collection,
    timestamp: event.timestamp,
    json: JSON.stringify(event),
  }

  const result = await fetch('https://www.graphjson.com/api/log', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if(result.status != 200) {
    const resultText = await result.text()
    console.error(`GraphJSON error. Status ${result.status}, ${result.statusText}, ${resultText}`)
  }

  console.log('Logged event to GraphJSON', event)
}
