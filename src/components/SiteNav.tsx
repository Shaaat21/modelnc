import { Link } from 'react-router-dom'

function SiteNav() {
  return (
    <nav className="Nav_list" aria-label="Main navigation">
      <Link className="brand_link" to="/maindisplay">
        <h1>Company Name</h1>
      </Link>
      <ul className="listman">
        <li>About us</li>
        <li>Contact</li>
        <li className="DropDownHolder">
          <button type="button" className="DropDownButton">
            Socials
          </button>
          <ul className="Sociallist">
            <li>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://twitter.com/" target="_blank" rel="noreferrer">
                Twitter
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  )
}

export default SiteNav
