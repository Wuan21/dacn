export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
  }
  res.end()
}
