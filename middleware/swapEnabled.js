import network from '~/common/network'

export default function ({ store, redirect }) {
  if (!network.swapEnabled) {
    return redirect('/welcome')
  }
}
