import Head from 'next/head'
import { getGraphJSONApiKey, getGraphJSONCollectionRuns, getGraphJSONCollectionZones } from '../lib/env';
import * as graphjson from '../lib/graphjson';

export async function getStaticProps() {
  const apiKey = getGraphJSONApiKey()
  const graphJSONCollectionRuns = getGraphJSONCollectionRuns()
  const graphJSONCollectionZones = getGraphJSONCollectionZones()

  const cumulativeDistanceOverTimeIframeURL = await graphjson.makeCumulativeDistanceOverTimeIframeURL(apiKey, graphJSONCollectionRuns)

  const cumulativeDistanceIframeURL = await graphjson.makeCumulativeDistanceMonthIframeURL(apiKey, graphJSONCollectionRuns)
  const cumulativeDurationIframeURL = await graphjson.makeCumulativeDurationMonthIframeURL(apiKey, graphJSONCollectionRuns)
  const heartRateZonesIframeURL = await graphjson.makeHeartRateZonesMonthIframeURL(apiKey, graphJSONCollectionZones)

  const distanceOverTimeIframeURL = await graphjson.makeDistanceOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const durationOverTimeIframeURL = await graphjson.makeDurationOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const paceOverTimeIframeURL = await graphjson.makePaceOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const heartRateOverTimeIframeURL = await graphjson.makeHeartRateOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const heartRateZonesOverTimeIframeURL = await graphjson.makeHeartRateZonesOverTimeIframeURL(apiKey, graphJSONCollectionZones)
  const scoreOverTimeIframeURL = await graphjson.makeAverageScoreOverTimeIframeURL(apiKey, graphJSONCollectionRuns)

  return {
    props: {
      iframeURLs: {
        cumulativeDistanceOverTime: cumulativeDistanceOverTimeIframeURL,
        cumulativeDistance: cumulativeDistanceIframeURL,
        cumulativeDuration: cumulativeDurationIframeURL,
        heartRateZones: heartRateZonesIframeURL,
        distanceOverTime: distanceOverTimeIframeURL,
        durationOverTime: durationOverTimeIframeURL,
        paceOverTime: paceOverTimeIframeURL,
        heartRateOverTime: heartRateOverTimeIframeURL,
        heartRateZonesOverTime: heartRateZonesOverTimeIframeURL,
        scoreOverTime: scoreOverTimeIframeURL,
      }
    },
  }
}

type IframeProps = {
  url: string,
}

function Iframe({ url }: IframeProps) {
  return (
    <iframe className="bg-white p-2 shadow-md border border-blue-100"  height="400px" width="100%" src={url}></iframe>
  )
}

type HomeProps = {
  iframeURLs: {
    [name: string]: string
  }
}

export default function Home({ iframeURLs }: HomeProps) {
  return (
    <div>
      <Head>
        <title>Callum&apos;s Running Dashboard</title>
        <meta name="description" content="Dashboard for tracking my runs!" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <main role="main" className="p-1 md:p-4 max-w-screen-2xl m-auto">
        <h1 className="prose prose-2xl text-blue-600">Callum&apos;s Running Dashboard</h1>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="col-span-2"><Iframe url={iframeURLs.cumulativeDistanceOverTime} /></div>
          <Iframe url={iframeURLs.cumulativeDistance}></Iframe>
          <div className='col-span-2'><Iframe url={iframeURLs.heartRateZones} /></div>
          <Iframe url={iframeURLs.cumulativeDuration}></Iframe>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Iframe url={iframeURLs.distanceOverTime}></Iframe>
          <Iframe url={iframeURLs.durationOverTime}></Iframe>
          <Iframe url={iframeURLs.paceOverTime}></Iframe>
          <Iframe url={iframeURLs.heartRateOverTime}></Iframe>
          <Iframe url={iframeURLs.scoreOverTime} />
          <div className="col-span-1 md:col-span-2">
            <Iframe url={iframeURLs.heartRateZonesOverTime}></Iframe>
          </div>
        </section>
      </main>
    </div>
  )
}