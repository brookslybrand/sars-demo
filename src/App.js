import React, { useEffect, useState } from 'react'

function App() {
  const sarsData = useSARSData()

  console.log(sarsData)
  return (
    <main className="antialiased text-gray-900">
      <section className="m-2">
        <h1 className="text-3xl">Andy you're a SARS</h1>
        {sarsData.status === 'loading' ? (
          <p className="text-sm text-gray-700">
            Loading<span className="tracking-tight">. . .</span>
          </p>
        ) : null}
      </section>
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
    fetch('http://127.0.0.1:8000/records/')
      .then(response => response.json())
      .then(data => {
        setSARSData({ status: 'resolved', data, error: null })
      })
      .catch(error =>
        setSARSData({ status: 'error', data: null, error: error })
      )
  }, [])

  return sarsData
}

export default App
