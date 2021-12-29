export type ActivityEvent = {
  collection: string;
  timestamp: number;
  kcal: number;
  activity_type: string;
  distance_km: number;
  duration_mins_f: number;
  pace_mins_per_km: number;
  elevation_ascended_m: number;
  elevation_maximum_m: number;
  elevation_minimum_m: number;
  heart_rate_a: number | null;
  heart_rate_b: number | null;
  heart_rate_c: number | null;
  heart_rate_d: number | null;
  heart_rate_e: number | null;
  heart_rate_avg_rounded_i: number;
  heart_rate_max: number;
  mets_average: number;
  score: number;
};

export type ZoneEvent = {
  collection: string;
  timestamp: number;
  zone: string;
  value: number;
};

export type GraphJSONEvent = ActivityEvent | ZoneEvent
