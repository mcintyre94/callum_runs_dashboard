export const getGraphJSONApiKey = (): string => {
  const apiKey = process.env.GRAPHJSON_API_KEY;
  if(!apiKey) {
    throw 'Missing environment variable GRAPHJSON_API_KEY. This can be obtained from the graphjson.com dashboard';
  }
  return apiKey
}

export const getGraphJSONProjectRuns = (): string => {
  const graphJsonProjectRuns = process.env.GRAPHJSON_PROJECT_RUNS
  if(!graphJsonProjectRuns) {
    throw 'Missing environment variable GRAPHJSON_PROJECT_RUNS. This should be eg. callum_runs_dev';
  }
  return graphJsonProjectRuns
}

export const getGraphJSONProjectZones = (): string => {
  const graphJsonProjectZones = process.env.GRAPHJSON_PROJECT_ZONES
  if(!graphJsonProjectZones) {
    throw 'Missing environment variable GRAPHJSON_PROJECT_ZONES. This should be eg. hr_zones_dev';
  }
  return graphJsonProjectZones
}

export const getImportApiKey = (): string => {
  const apiKey = process.env.IMPORT_API_KEY
  if(!apiKey) {
    throw 'Missing environment variable IMPORT_API_KEY. This is required to secure the import API route'
  }
  return apiKey
}