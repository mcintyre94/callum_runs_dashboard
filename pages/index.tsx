import Head from 'next/head'
import { getGraphJSONApiKey, getGraphJSONProjectRuns, getGraphJSONProjectZones } from '../lib/env';
import * as graphjson from '../lib/graphjson';

export async function getStaticProps() {
  const apiKey = getGraphJSONApiKey()
  const graphJSONProjectRuns = getGraphJSONProjectRuns()
  const graphJSONProjectZones = getGraphJSONProjectZones()

  const cumulativeDistanceIframeURL = await graphjson.makeCumulativeDistanceMonthIframeURL(apiKey, graphJSONProjectRuns)
  const cumulativeDurationIframeURL = await graphjson.makeCumulativeDurationMonthIframeURL(apiKey, graphJSONProjectRuns)
  const heartRateZonesIframeURL = await graphjson.makeHeartRateZonesMonthIframeURL(apiKey, graphJSONProjectZones)

  const distanceOverTimeIframeURL = await graphjson.makeDistanceOverTimeIframeURL(apiKey, graphJSONProjectRuns)
  const durationOverTimeIframeURL = await graphjson.makeDurationOverTimeIframeURL(apiKey, graphJSONProjectRuns)
  const paceOverTimeIframeURL = await graphjson.makePaceOverTimeIframeURL(apiKey, graphJSONProjectRuns)
  const heartRateOverTimeIframeURL = await graphjson.makeHeartRateOverTimeIframeURL(apiKey, graphJSONProjectRuns)
  const heartRateZonesOverTimeIframeURL = await graphjson.makeHeartRateZonesOverTimeIframeURL(apiKey, graphJSONProjectZones)

  return {
    props: {
      iframeURLs: {
        cumulativeDistance: cumulativeDistanceIframeURL,
        cumulativeDuration: cumulativeDurationIframeURL,
        heartRateZones: heartRateZonesIframeURL,
        distanceOverTime: distanceOverTimeIframeURL,
        durationOverTime: durationOverTimeIframeURL,
        paceOverTime: paceOverTimeIframeURL,
        heartRateOverTime: heartRateOverTimeIframeURL,
        heartRateZonesOverTime: heartRateZonesOverTimeIframeURL,
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

        <h2 className="prose prose-xl">The last month</h2>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Iframe url={iframeURLs.cumulativeDistance}></Iframe>
          <Iframe url={iframeURLs.cumulativeDuration}></Iframe>
          <Iframe url={iframeURLs.heartRateZones}></Iframe>
        </section>

        <h2 className="prose prose-xl">Day-to-day</h2>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Iframe url={iframeURLs.distanceOverTime}></Iframe>
          <Iframe url={iframeURLs.durationOverTime}></Iframe>
          <Iframe url={iframeURLs.paceOverTime}></Iframe>
          <Iframe url={iframeURLs.heartRateOverTime}></Iframe>
          <div className="col-span-1 md:col-span-2">
            <Iframe url={iframeURLs.heartRateZonesOverTime}></Iframe>
          </div>
        </section>
      </main>
    </div>
  )
}