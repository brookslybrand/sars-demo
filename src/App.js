import React, { useEffect, useState } from 'react'

function App() {
  const sarsData = useSARSData()

  return (
    <main className="antialiased text-gray-900 m-4">
      <header>
        <h1 className="text-3xl">Andy you're a SARS</h1>
        {sarsData.status === 'loading' && <Loading />}
        {sarsData.status === 'rejected' && <Error error={sarsData.error} />}
      </header>
      {sarsData.status === 'resolved' && <Plot data={sarsData.data} />}
    </main>
  )
}

const useSARSData = () => {
  const [sarsData, setSARSData] = useState({
    status: 'loading',
    data: null,
    error: null
  })
  useEffect(() => {
    fetch('https://sars-kysxppr52a-uw.a.run.app/records/')
      .then(response => response.json())
      .then(data => {
        setSARSData({ status: 'resolved', data, error: null })
      })
      .catch(error =>
        setSARSData({ status: 'rejected', data: null, error: error })
      )
  }, [])

  return sarsData
}

function Loading() {
  return (
    <p className="text-sm text-gray-700 mt-2">
      Loading<span className="tracking-tight">. . .</span>
    </p>
  )
}

function Error({ error }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl">Oh No...</h2>
      <details className="ml-2">
        <summary>Expand to see the error</summary>
        {error.message}
        <br />
        {error.stack}
      </details>
    </div>
  )
}

function Plot({ data }) {
  console.log(data)

  return (
    <section className="text-center">
      <p>Success!</p>
    </section>
  )
}

export default App
