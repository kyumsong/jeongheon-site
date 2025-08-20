import { useContext, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import Brightness2Icon from '@material-ui/icons/Brightness2'
import WbSunnyRoundedIcon from '@material-ui/icons/WbSunnyRounded'
import MenuIcon from '@material-ui/icons/Menu'
import CloseIcon from '@material-ui/icons/Close'
import { ThemeContext } from '../../contexts/theme'
import { projects, skills, contact } from '../../portfolio'
import './Navbar.css'

const Navbar = () => {
  const [{ themeName, toggleTheme }] = useContext(ThemeContext)
  const [showNavList, setShowNavList] = useState(false)
  const history = useHistory()
  const location = useLocation()

  const toggleNavList = () => setShowNavList(!showNavList)

  const handleNavClick = (sectionId) => {
    setShowNavList(false)
    if (location.pathname !== '/') {
      history.push('/')
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className='center nav'>
      <ul
        style={{ display: showNavList ? 'flex' : null }}
        className='nav__list'
      >
        {projects.length ? (
          <li className='nav__list-item'>
            <button
              type="button"
              className='link link--nav'
              onClick={() => handleNavClick('projects')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              학력
            </button>
          </li>
        ) : null}

        {skills.length ? (
          <li className='nav__list-item'>
            <button
              type="button"
              className='link link--nav'
              onClick={() => handleNavClick('skills')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              경력
            </button>
          </li>
        ) : null}

        {/* <li className='nav__list-item'>
          <button
            type="button"
            className='link link--nav'
            onClick={() => handleNavClick('posts')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            글모음
          </button>
        </li> */}

        <li className='nav__list-item'>
          <button
            type="button"
            className='link link--nav'
            onClick={() => handleNavClick('sermons')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            설교
          </button>
        </li>

        {contact.email ? (
          <li className='nav__list-item'>
            <button
              type="button"
              className='link link--nav'
              onClick={() => handleNavClick('contact')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              연락처
            </button>
          </li>
        ) : null}
      </ul>

      <button
        type='button'
        onClick={toggleTheme}
        className='btn btn--icon nav__theme'
        aria-label='toggle theme'
      >
        {themeName === 'dark' ? <WbSunnyRoundedIcon /> : <Brightness2Icon />}
      </button>

      <button
        type='button'
        onClick={toggleNavList}
        className='btn btn--icon nav__hamburger'
        aria-label='toggle navigation'
      >
        {showNavList ? <CloseIcon /> : <MenuIcon />}
      </button>
    </nav>
  )
}

export default Navbar