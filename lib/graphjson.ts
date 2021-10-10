import type { GraphJSONEvent } from "./event"

enum LineColour {
  Distance = '#0345fc',
  Duration = '#036648',
  Pace = '#ec8d09',
  HeartRate = '#ba040d',
}

enum Metric {
  DistanceKm = 'distance_km',
  DurationsMins = 'duration_mins_f',
  PaceMinsPerKm = 'pace_mins_per_km',
  HeartRateBpm = 'heart_rate_avg_rounded_i',
  ZoneValue = 'value',
  Zone = 'zone',
}

enum MetricLabel {
  Distance = 'Distance',
  Duration = 'Duration',
  Pace = 'Pace',
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

enum Time {
  OneMonthAgo = '1 month ago',
  Now = 'now',
  Start2020 = '01/01/2020 0:00 am',
  FifteenSeptember2021 = '09/15/2021 0:00 am', // there's currently a broken HR zone on 15th september
}

enum Granularity {
  Day = 'Day',
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
  value_suffix: Suffix
}

type GraphJSONFilter = [string, string, string]

type GraphJSONPayload = {
  api_key: string,
  IANA_time_zone: string,
  graph_type: GraphType,
  start: Time,
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
  IANA_time_zone: string,
  graph_type: GraphType,
  start: string,
  end: string,
  filters: GraphJSONFilter[],
  customizations: {}
}

type GraphJSONEventPayload = {
  api_key: string,
  json: string,
  timestamp: number,
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

export const makeCumulativeDistanceMonthIframeURL = async (apiKey: string, runsProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.CumulativeLine,
    start: Time.OneMonthAgo,
    end: Time.Now,
    compare: Time.OneMonthAgo,
    filters: [projectFilter(runsProject)],
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
      title: 'Distance (km)',
      metric: MetricLabel.Distance,
      comparison: ComparisonLabel.LastMonth,
      value_suffix: Suffix.Km,
    }
  }

  return requestIframeURL(payload)
}

export const makeCumulativeDurationMonthIframeURL = async (apiKey: string, runsProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.CumulativeLine,
    start: Time.OneMonthAgo,
    end: Time.Now,
    compare: Time.OneMonthAgo,
    filters: [projectFilter(runsProject)],
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
      title: 'Duration (mins)',
      metric: MetricLabel.Duration,
      comparison: ComparisonLabel.LastMonth,
      value_suffix: Suffix.Mins
    }
  }

  return requestIframeURL(payload);
}

export const makeHeartRateZonesMonthIframeURL = async (apiKey: string, zonesProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.StackedLine,
    start: Time.OneMonthAgo,
    end: Time.FifteenSeptember2021,
    filters: [projectFilter(zonesProject)],
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
      title: 'Heart Rate Zones (Last month)',
      metric: MetricLabel.Proportion,
      value_suffix: Suffix.Percent,
    }
  }

  return requestIframeURL(payload);
}

export const makeDistanceOverTimeIframeURL = async (apiKey: string, runsProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2020,
    end: Time.Now,
    filters: [projectFilter(runsProject)],
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

export const makeDurationOverTimeIframeURL = async (apiKey: string, runsProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2020,
    end: Time.Now,
    filters: [projectFilter(runsProject)],
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

export const makePaceOverTimeIframeURL = async (apiKey: string, runsProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2020,
    end: Time.Now,
    filters: [projectFilter(runsProject)],
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

export const makeHeartRateOverTimeIframeURL = async (apiKey: string, runsProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.SingleLine,
    start: Time.Start2020,
    end: Time.Now,
    filters: [projectFilter(runsProject)],
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

export const makeHeartRateZonesOverTimeIframeURL = async (apiKey: string, zonesProject: string) => {
  const payload: GraphJSONPayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.London,
    graph_type: GraphType.StackedLine,
    start: Time.Start2020,
    end: Time.FifteenSeptember2021,
    filters: [projectFilter(zonesProject)],
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

export type RunSample = {
  timestamp: number
  json: Object
}

export const getRunSamples = async (apiKey: string, runsProject: string, startDate: string, endDate: string): Promise<RunSample[]> => {
  const payload: GraphJSONSamplePayload = {
    api_key: apiKey,
    IANA_time_zone: Timezone.UTC,
    graph_type: GraphType.Samples,
    start: startDate,
    end: endDate,
    filters: [projectFilter(runsProject)],
    customizations: {},
  }

  const graphJSONData = await requestData(payload)
  return graphJSONData.result
}

export const logEvent = async (event: GraphJSONEvent, apiKey: string): Promise<void> => {
  const payload: GraphJSONEventPayload = {
    api_key: apiKey,
    json: JSON.stringify(event),
    timestamp: event.timestamp
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
