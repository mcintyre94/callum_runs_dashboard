export type ActivityEvent = {
  collection: string;
  project: string; // TODO: remove when migrated to collections
  timestamp: number;
  kcal: number;
  activity_type: string;
  distance_km: number;
  duration_mins_f: number;
  pace_mins_per_km: number;
  elevation_ascended_m: number;
  elevation_maximum_m: number;
  elevation_minimum_m: number;
  heart_rate_a: number;
  heart_rate_b: number;
  heart_rate_c: number;
  heart_rate_d: number;
  heart_rate_e: number;
  heart_rate_avg_rounded_i: number;
  heart_rate_max: number;
  mets_average: number;
};

export type ZoneEvent = {
  collection: string;
  project: string; // TODO: remove when migrated to collections
  timestamp: number;
  zone: string;
  value: number;
};

export type GraphJSONEvent = ActivityEvent | ZoneEvent
