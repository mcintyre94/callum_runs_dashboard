import Head from 'next/head'
import { getGraphJSONApiKey, getGraphJSONCollectionRuns, getGraphJSONCollectionZones } from '../lib/env';
import * as graphjson from '../lib/graphjson';

export async function getStaticProps() {
  const apiKey = getGraphJSONApiKey()
  const graphJSONCollectionRuns = getGraphJSONCollectionRuns()
  const graphJSONCollectionZones = getGraphJSONCollectionZones()

  const cumulativeDistanceYearIframeURL = await graphjson.makeCumulativeDistanceYearIframeURL(apiKey, graphJSONCollectionRuns)
  const weeklyTargetIframeURL = await graphjson.makeWeeklyTargetIframeURL(apiKey)
  const dailyTargetIframeURL = await graphjson.makeDailyTargetIframeURL(apiKey)

  const cumulativeDistanceIframeURL = await graphjson.makeCumulativeDistanceMonthIframeURL(apiKey, graphJSONCollectionRuns)
  const cumulativeDurationIframeURL = await graphjson.makeCumulativeDurationMonthIframeURL(apiKey, graphJSONCollectionRuns)
  const heartRateZonesIframeURL = await graphjson.makeHeartRateZonesMonthIframeURL(apiKey, graphJSONCollectionZones)
  const scoreIframeUrl = await graphjson.makeScoreMonthIframeURL(apiKey, graphJSONCollectionRuns)

  const distanceOverTimeIframeURL = await graphjson.makeDistanceOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const durationOverTimeIframeURL = await graphjson.makeDurationOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const paceOverTimeIframeURL = await graphjson.makePaceOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const heartRateOverTimeIframeURL = await graphjson.makeHeartRateOverTimeIframeURL(apiKey, graphJSONCollectionRuns)
  const heartRateZonesOverTimeIframeURL = await graphjson.makeHeartRateZonesOverTimeIframeURL(apiKey, graphJSONCollectionZones)
  const scoreOverTimeIframeURL = await graphjson.makeAverageScoreOverTimeIframeURL(apiKey, graphJSONCollectionRuns)

  return {
    props: {
      iframeURLs: {
        cumulativeDistanceYear: cumulativeDistanceYearIframeURL,
        weeklyTarget: weeklyTargetIframeURL,
        dailyTarget: dailyTargetIframeURL,
        cumulativeDistance: cumulativeDistanceIframeURL,
        cumulativeDuration: cumulativeDurationIframeURL,
        heartRateZones: heartRateZonesIframeURL,
        score: scoreIframeUrl,
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

enum IframeHeight {
  Full = "400px",
  Half = "192px",
}

type IframeProps = {
  url: string,
  height: IframeHeight,
}

function Iframe({ url, height }: IframeProps) {
  return (
    <iframe className="bg-white p-2 shadow-md border border-blue-100"  height={height} width="100%" src={url}></iframe>
  )
}

type HomeProps = {
  iframeURLs: {
    [name: string]: string
  }
}

function Title({ children }) {
  return (
    <h3 className="text-2xl text-blue-400 font-medium pb-4">{children}</h3>
  )
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

        <section>
          <Title>Goal: 2022 km in 2022</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="col-span-2"><Iframe url={iframeURLs.cumulativeDistanceYear} height={IframeHeight.Full} /></div>
            <div className="flex flex-col md:flex-row lg:flex-col gap-4">
              <Iframe url={iframeURLs.weeklyTarget} height={IframeHeight.Half} />
              <Iframe url={iframeURLs.dailyTarget} height={IframeHeight.Half} />
            </div>
          </div>
        </section>

          
        <section>
          <Title>This Month</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
            <Iframe url={iframeURLs.cumulativeDistance} height={IframeHeight.Full} />
            <Iframe url={iframeURLs.cumulativeDuration}  height={IframeHeight.Full} />
            <Iframe url={iframeURLs.heartRateZones} height={IframeHeight.Full} />
            <Iframe url={iframeURLs.score} height={IframeHeight.Full} />
          </div>
        </section>

        <section>
          <Title>Trends</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <Iframe url={iframeURLs.heartRateZonesOverTime} height={IframeHeight.Full} />
            </div>
            <Iframe url={iframeURLs.distanceOverTime} height={IframeHeight.Full} />
            <Iframe url={iframeURLs.durationOverTime} height={IframeHeight.Full} />
            <Iframe url={iframeURLs.paceOverTime} height={IframeHeight.Full} />
            <Iframe url={iframeURLs.heartRateOverTime} height={IframeHeight.Full} />
            <Iframe url={iframeURLs.scoreOverTime} height={IframeHeight.Full} />
          </div>
        </section>
      </main>
    </div>
  )
}