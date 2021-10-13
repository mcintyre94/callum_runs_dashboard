import React, { useEffect, useState, useRef } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { createPythonClient } from '@run-wasm/python'
import Script from 'next/script'
import { clearGraph, defaultGraphCode, preloadData, preloadMatplotlibCode } from '../pythonFragments'
import { getRunSamples, RunSample, Time } from '../lib/graphjson'
import { getGraphJSONApiKey, getGraphJSONProjectRuns } from '../lib/env'

declare global {
  // <- [reference](https://stackoverflow.com/a/56458070/11542903)
  interface Window {
    loadPyodide: Function
  }
}

// Server-side props: fetch the run data using GraphJSON
export async function getServerSideProps() {
  const apiKey = getGraphJSONApiKey()
  const project = getGraphJSONProjectRuns()

  const runSamples: RunSample[] = await getRunSamples(apiKey, project, Time.Start2020, Time.Now)
  const runData = runSamples.map(s => s.json)

  return { props: { runData } }
}

function App( { runData }) {
  const [inputCode, setInputCode] = useState(defaultGraphCode)
  const [loadingText, setLoadingText] = useState('Loading pyodide...')
  const [pyodide, setPyodide] = useState(null)
  const editorRef = useRef(null)
  const [monaco, setMonaco] = useState<Monaco>(null)

  // Note that window.loadPyodide comes from the beforeInteractive pyodide.js Script
  useEffect(() => {
    window
      .loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.1/full/',
      })
      .then((pyodide) => {
        setLoadingText('Loading matplotlib...')
        return preloadMatplotlib(pyodide)
      })
      .then((pyodide) => {
        setLoadingText('Preloading data...')
        runCode(preloadData(runData), pyodide)
        return pyodide
      })
      .then((pyodide) => setPyodide(pyodide))
  }, [])

  async function preloadMatplotlib(pyodide) {
    await pyodide.loadPackage('matplotlib')
    pyodide.runPython(preloadMatplotlibCode)
    return pyodide
  }

  async function runCode(code: string, pyodide: any) {
    let pythonClient = createPythonClient(pyodide)
    await pythonClient.run( { code: clearGraph })
    const output = await pythonClient.run({ code })
    console.log('output', output)
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
    setMonaco(monaco)
  }

  return (
    <>
      <div className="max-w-4xl px-4 py-2 mx-auto sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Script
            src="https://cdn.jsdelivr.net/pyodide/v0.18.1/full/pyodide.js"
            strategy="beforeInteractive"
          />
          <Script src="https://kit.fontawesome.com/137d63e13e.js" />
          <main className="mx-auto py-2 max-w-7xl sm:mt-24">
            <div className="text-left">
              <h1 className="text-3xl tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-5xl">Playground!</h1>
              <p className="max-w-md mt-4 text-base text-gray-500 dark:text-gray-450 md:mx-auto sm:text-lg md:mt-16 md:text-xl md:max-w-3xl">
                This page provides a Python editor to explore my running data! Example row:
              </p>
              <pre className="text-gray-900 font-mono border border-dotted border-gray-900">
              {`{
  project: 'callum_runs_prod_v6',
  timestamp: 1627544381,
  datetime: <native Python datetime>,
  kcal: 368.791,
  activity_type: 'Running',
  distance_km: 5.292,
  duration_mins_f: 32.8,
  pace_mins_per_km: 6.2,
  elevation_ascended_m: 31.27,
  elevation_maximum_m: 45.577,
  elevation_minimum_m: 13.099,
  heart_rate_a: 0,
  heart_rate_b: 0,
  heart_rate_c: 0.147,
  heart_rate_d: 0.853,
  heart_rate_e: 0,
  heart_rate_avg_rounded_i: 164,
  heart_rate_max: 172,
  mets_average: 10.608
}`}
              </pre>
            </div>
          </main>

          <div>
            <div className="mt-1 dark:text-gray-450">
              <Editor
                height="20rem"
                defaultLanguage="python"
                defaultValue={inputCode}
                onChange={(value) => setInputCode(value ?? '')}
                className="block w-1/2  text-white bg-gray-900 border-gray-300 rounded-lg   shadow-sm p-0.5 border   dark:border-purple-300 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                theme="vs-dark"
                options={{ fontSize: 12 }}
                onMount={handleEditorDidMount}
              />
            </div>
          </div>

          {!pyodide && (
            <label className="block pt-8 text-sm font-medium text-gray-700 dark:text-gray-450">
              {loadingText}
            </label>
          )}

          {pyodide && (
            <div className="pt-8 ">
              <div className="grid items-start justify-left">
                <div className="relative group">
                  <button
                    className="relative flex items-center py-4 leading-none bg-black divide-x divide-gray-600 rounded-lg px-7"
                    onClick={() => runCode(inputCode, pyodide)}
                  >
                    <span className="text-gray-100 transition duration-200 group-hover:text-gray-100">
                      Run Code →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="plot" />
        </div>
      </div>
    </>
  )
}

export default App