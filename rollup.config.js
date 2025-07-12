import { visualizer } from 'rollup-plugin-visualizer'

const config = {
  plugins: [
    visualizer({
      filename: 'bundle-graph.html',
      open: true,
    })
  ]
}

export default config
