import { Link } from 'react-router-dom'
import firstVideo from './modelvid.mp4'

function App() {
  return (
    <>
      <video autoPlay loop muted playsInline className="background-video">
        <source src={firstVideo} type="video/mp4" />
      </video>
      <main className="Main Page">
        <section className="clickinto">
          <Link to="/maindisplay">
            <h1 className="Enter">ENTER</h1>
          </Link>
          <h2 className="clickinto2">Click to start shopping</h2>
        </section>
      </main>
    </>
  )
}

export default App
