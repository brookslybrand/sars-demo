import React, { useEffect, useState, useRef, useMemo } from 'react'
import * as d3 from 'd3'

function App() {
  const sarsData = useSARSData()

  return (
    <main className="antialiased text-gray-900 m-4">
      <header>
        <h1 className="text-3xl">SARS 2003</h1>
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
      // convert dates and sort by date
      .then(data => {
        for (const datum of data) {
          datum.date = new Date(datum.date).valueOf()
        }
        data.sort((a, b) => a.date - b.date)
        return data
      })
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

const categories = ['cases', 'deaths', 'recoveries']
const width = 900
const height = 500
const margin = { top: 10, right: 120, bottom: 50, left: 50 }
const legendWidth = 30
const color = d3
  .scaleOrdinal()
  .domain(categories)
  .range(d3.schemeCategory10)

function Plot({ data }) {
  const barsRef = useRef()
  const xAxisRef = useRef()
  const yAxisRef = useRef()

  const aggregatedData = useAggregatedData(data)

  // taken from https://observablehq.com/@d3/stacked-area-chart
  useEffect(() => {
    // Pass our data to the stack to generate the layer positions

    const series = d3.stack().keys(categories)(aggregatedData)

    const xScale = d3
      .scaleUtc()
      .domain(d3.extent(aggregatedData, d => d.date))
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .nice()
      .range([height - margin.bottom, margin.top])

    const area = d3
      .area()
      .x(d => xScale(d.data.date))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))

    d3.select(barsRef.current)
      .selectAll('path')
      .data(series)
      .join('path')
      .attr('fill', ({ key }) => color(key))
      .attr('d', area)
      .append('title')
      .text(({ key }) => key)

    d3.select(xAxisRef.current)
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(width / 80)
          .tickSizeOuter(0)
      )

    d3.select(yAxisRef.current)
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .call(g => g.select('.domain').remove())
      .call(g =>
        g
          .select('.tick:last-of-type text')
          .clone()
          .attr('x', 3)
          .attr('text-anchor', 'start')
          .attr('font-weight', 'bold')
          .text(aggregatedData.y)
      )
  }, [aggregatedData])

  return (
    <section className="text-center max-w-5xl max-h-full">
      <svg viewBox={`0, 0, ${width}, ${height}`}>
        {categories.map((category, idx) => {
          const y = margin.top + 20 * idx
          const x = width - margin.right + 5
          return (
            <g>
              <line
                key={category}
                x1={x}
                y1={y}
                x2={x + legendWidth}
                y2={y}
                stroke={color(category)}
                strokeWidth={3}
              />
              <text
                className="text-xs font-light capitalize"
                x={x + legendWidth + 5}
                y={y}
                alignmentBaseline="middle"
              >
                {category}
              </text>
            </g>
          )
        })}

        <g ref={barsRef} />
        <g ref={xAxisRef} />
        <g ref={yAxisRef} />
      </svg>
    </section>
  )
}

const useAggregatedData = data =>
  useMemo(() => {
    let aggregationMap = new Map()
    // go through everything and create a map of the aggregated data
    for (const { date, cases, deaths, recoveries } of data) {
      const values = aggregationMap.get(date)
      const total = cases + deaths + recoveries

      if (values === undefined) {
        aggregationMap.set(date, { cases, deaths, recoveries, total })
      } else {
        values.cases += cases
        values.deaths += deaths
        values.recoveries += recoveries
        values.total += total
      }
    }

    return [...aggregationMap.keys()]
      .map(key => ({
        // date: new Date(key),
        date: key,
        ...aggregationMap.get(key)
      }))
      .sort((a, b) => a.date - b.date)
  }, [data])

export default App
