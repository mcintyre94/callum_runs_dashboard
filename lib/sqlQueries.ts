export type SQLQuery = string;

const start2022 = 1640995200;
const end2022 = 1672531199;

export const weeklyTargetSqlQuery = (activitiesCollection: string): SQLQuery => `
SELECT
  now('Europe/London') as date,
  toWeek(date, 8) as week_num,
  52 - week_num + 1 as weeks_left,
  sum(JSONExtractFloat(json, 'distance_km')) as total_distance,
  2022 - total_distance as required_distance,
  round(required_distance / weeks_left, 2) as weekly_required 
FROM ${activitiesCollection} 
WHERE JSONExtractString(json, 'activity_type') = 'Running' 
AND JSONExtractInt(json, 'timestamp') > ${start2022} 
AND JSONExtractInt(json, 'timestamp') < ${end2022}`;

export const dailyTargetSqlQuery = (activitiesCollection: string): SQLQuery => `
SELECT
  now('Europe/London') as date,
  toDayOfWeek(date) as day_num,
  365 - day_num as days_left,
  sum(JSONExtractFloat(json, 'distance_km')) as total_distance,
  2022 - total_distance as required_distance,
  round(required_distance / days_left, 2) as daily_required
FROM ${activitiesCollection}
WHERE JSONExtractString(json, 'activity_type') = 'Running'
AND JSONExtractInt(json, 'timestamp') > ${start2022}
AND JSONExtractInt(json, 'timestamp') < ${end2022}`;