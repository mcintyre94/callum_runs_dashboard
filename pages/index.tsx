import Head from 'next/head'
import { getApiKey, getGraphJSONProjectRuns, getGraphJSONProjectZones } from '../lib/env';
import * as graphjson from '../lib/graphjson';

export async function getStaticProps() {
  const apiKey = getApiKey()
  const graphJSONProjectRuns = getGraphJSONProjectRuns()
  const graphJSONProjectZones = getGraphJSONProjectZones()

  const cumulativeDistanceIframeURL = await graphjson.makeCumulativeDistanceMonthIframeURL(apiKey, graphJSONProjectRuns)
  const cumulativeDurationIframeURL = await graphjson.makeCumulativeDurationMonthIframeURL(apiKey, graphJSONProjectRuns)

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
  url: string
}

function Iframe({ url }: IframeProps) {
  return (
    <iframe height="400px" src={url}></iframe>
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
        <title>Callum's Runs</title>
        <meta name="description" content="Dashboard for tracking my runs!" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <main role="main">
        <h1>Callum's Running Dashboard</h1>

        <section>
          <h1>The last month</h1>
          <Iframe url={iframeURLs.cumulativeDistance}></Iframe>
          <Iframe url={iframeURLs.cumulativeDuration}></Iframe>
        </section>

        <section>
          <h1>Day-to-day</h1>
          <Iframe url={iframeURLs.distanceOverTime}></Iframe>
          <Iframe url={iframeURLs.durationOverTime}></Iframe>
          <Iframe url={iframeURLs.paceOverTime}></Iframe>
          <Iframe url={iframeURLs.heartRateOverTime}></Iframe>
          <Iframe url={iframeURLs.heartRateZonesOverTime}></Iframe>
        </section>
      </main>
    </div>
  )
}