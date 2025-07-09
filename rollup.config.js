import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      filename: 'bundle-graph.html',
      open: true,
    })
  ]
}
