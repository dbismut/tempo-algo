useEffect(() => {
  if (!selectedDataSet) return
  // @ts-ignore
  const solutionPoints: number[] = groupedResults[songName]['__SOLUTION'][visualize]
  // @ts-ignore
  const dataSetPoints: number[] = selectedDataSet[visualize]

  const points = dataSetPoints.map((k, i) => ({
    x: i,
    y0: k,
    y1: solutionPoints[i],
  }))

  const a = d3
    .area<{ x: number; y0: number; y1: number }>()
    .x((p) => p.x)
    .y0((p) => p.y0)
    .y1((p) => p.y1)
    .curve(d3.curveLinear)

  const area = a(points)
  console.log({ area })

  const coords = solutionPoints
    .map((k, i) => [i, k])
    .concat(dataSetPoints.map((k, i) => [i, k]).reverse()) as [number, number][]

  console.log(d3.polygonArea(coords))
}, [groupedResults, selectedDataSet, songName, visualize])