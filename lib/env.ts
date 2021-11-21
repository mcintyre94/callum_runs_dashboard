export const getGraphJSONApiKey = (): string => {
  const apiKey = process.env.GRAPHJSON_API_KEY;
  if(!apiKey) {
    throw 'Missing environment variable GRAPHJSON_API_KEY. This can be obtained from the graphjson.com dashboard';
  }
  return apiKey
}

export const getGraphJSONCollectionRuns = (): string => {
  const graphJsonCollectionRuns = process.env.GRAPHJSON_COLLECTION_RUNS
  if(!graphJsonCollectionRuns) {
    throw 'Missing environment variable GRAPHJSON_COLLECTION_RUNS. This should be eg. callum_runs_dev';
  }
  return graphJsonCollectionRuns
}

export const getGraphJSONCollectionZones = (): string => {
  const graphJsonCollectionZones = process.env.GRAPHJSON_COLLECTION_ZONES
  if(!graphJsonCollectionZones) {
    throw 'Missing environment variable GRAPHJSON_COLLECTION_ZONES. This should be eg. hr_zones_dev';
  }
  return graphJsonCollectionZones
}

export const getImportApiKey = (): string => {
  const apiKey = process.env.IMPORT_API_KEY
  if(!apiKey) {
    throw 'Missing environment variable IMPORT_API_KEY. This is required to secure the import API route'
  }
  return apiKey
}