import type { GraphJSONEvent } from "./event"
import { DateTime } from "luxon"
import { dailyTargetSqlQuery, weeklyTargetSqlQuery } from "./sqlQueries";
import type { SQLQuery } from "./sqlQueries";

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
  PerWeekForGoal = 'Per Week For Goal',
  PerDayForGoal = 'Per Day For Goal',
}

enum GraphType {
  CumulativeLine = 'Cumulative Line',
  SingleLine = 'Single Line',
  StackedLine = 'Stacked Line',
  Samples = 'Samples',
  SingleValue = 'Single Value',
}

enum Aggregation {
  Sum = 'Sum',
  Avg = 'Avg',
}

export enum Time {
  OneMonthAgo = '1 month ago',
  Now = 'now',
  Start2021 = '01/01/2021 0:00 am',
  StartJuly2021 = '07/01/2021 0:00 am',
  Start2022 = '01/01/2022 0:00 am',
  End2022 = '12/31/2021 11:59 pm'
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
  SpaceKm = ' km',
  Mins = 'mins',
  MinsPerKm = 'mins/km',
  Bpm = 'bpm',
  Percent = '%',
}

type GraphJSONCustomizations = {
  lineColor?: LineColour,
  primaryColor?: LineColour,
  hideMissing: boolean,
  hideSummary: boolean,
  hideToolTip: boolean,
  showDots: boolean,
  hideXAxis: boolean,
  showYAxis: boolean,
  title: string,
  metric?: MetricLabel,
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

type GraphJSONQueryVisualisationPayload = {
  api_key: string,
  sql_query: SQLQuery,
  graph_type: GraphType,
  customizations: {
    primaryColor: LineColour,
    metric: MetricLabel,
    value_suffix: Suffix,
  },
  value_column: string,
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

const requestIframeURL = async (payload: GraphJSONPayload | GraphJSONQueryVisualisationPayload) => {
  const response = await fetch('https://api.graphjson.com/api/visualize/iframe', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  const jsonResponse: GraphJSONVisualiseIframeResponse = await response.json();
  return jsonResponse.url
}

const requestData = async (payload: GraphJSONSamplePayload): Promise<GraphJSONDataResponse> => {
  const response = await fetch('https://api.graphjson.com/api/visualize/data', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  const jsonResponse: GraphJSONDataResponse = await response.json()
  return jsonResponse
}


export const makeCumulativeDistanceYearIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.CumulativeLine,
    start: Time.Start2022,
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
      title: 'Total Distance',
      metric: MetricLabel.Distance,
      value_suffix: Suffix.Km,
    }
  }

  return requestIframeURL(payload);
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
    filters: [],
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


export const makeScoreMonthIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    collection: activitiesCollection,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: startOfMonth,
    end: Time.Now,
    compare: Time.OneMonthAgo,
    filters: [],
    metric: Metric.Score,
    aggregation: Aggregation.Avg,
    granularity: Granularity.Day,
    customizations: {
      lineColor: LineColour.Score,
      hideMissing: false,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Score this month',
      // metric: MetricLabel.Duration,
      comparison: ComparisonLabel.LastMonth,
      // value_suffix: Suffix.Mins
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
    granularity: Granularity.Week,
    customizations: {
      lineColor: LineColour.Distance,
      hideMissing: false,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Distance per week',
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
    granularity: Granularity.Week,
    customizations: {
      lineColor: LineColour.Duration,
      hideMissing: false,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Duration per week',
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
    granularity: Granularity.Week,
    customizations: {
      lineColor: LineColour.Pace,
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Average pace by week',
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
    granularity: Granularity.Week,
    customizations: {
      lineColor: LineColour.HeartRate,
      hideMissing: true,
      hideSummary: false,
      hideToolTip: false,
      showDots: true,
      hideXAxis: false,
      showYAxis: true,
      title: 'Average Heart Rate by week',
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
    filters: [],
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

export const makeWeeklyTargetIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONQueryVisualisationPayload = {
    api_key: apiKey,
    sql_query: weeklyTargetSqlQuery(activitiesCollection),
    graph_type: GraphType.SingleValue,
    customizations: {
      primaryColor: LineColour.Distance,
      metric: MetricLabel.PerWeekForGoal,
      value_suffix: Suffix.SpaceKm,
    },
    value_column: "weekly_required",
  }

  return requestIframeURL(payload);
}

export const makeDailyTargetIframeURL = async (apiKey: string, activitiesCollection: string) => {
  const payload: GraphJSONQueryVisualisationPayload = {
    api_key: apiKey,
    sql_query: dailyTargetSqlQuery(activitiesCollection),
    graph_type: GraphType.SingleValue,
    customizations: {
      primaryColor: LineColour.Distance,
      metric: MetricLabel.PerDayForGoal,
      value_suffix: Suffix.SpaceKm,
    },
    value_column: "daily_required",
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

  const result = await fetch('https://api.graphjson.com/api/log', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (result.status != 200) {
    const resultText = await result.text()
    console.error(`GraphJSON error. Status ${result.status}, ${result.statusText}, ${resultText}`)
  }

  console.log('Logged event to GraphJSON', event)
}
