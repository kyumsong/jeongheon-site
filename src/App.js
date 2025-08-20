import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { useContext } from 'react'
import { ThemeContext } from './contexts/theme'
import Header from './components/Header/Header'
import About from './components/About/About'
import Projects from './components/Projects/Projects'
import Skills from './components/Skills/Skills'
import Posts from './components/Posts/Posts'
import Sermons from './components/Sermons/Sermons'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import Contact from './components/Contact/Contact'
import Footer from './components/Footer/Footer'
import PostsPage from './pages/PostsPage'
import './App.css'

const App = () => {
  const [{ themeName }] = useContext(ThemeContext)

  return (
    <Router>
      <div id='top' className={`${themeName} app`}>
        <Header />

        <main>
          <Switch>
            <Route exact path="/">
              <About />
              <div className="side-by-side-container">
                <Projects />
                <Skills />
                <Posts />
                <Sermons />
              </div>
              <Contact />
            </Route>
            <Route path="/posts" component={PostsPage} />
          </Switch>
        </main>

        <ScrollToTop />
        <Footer />
      </div>
    </Router>
  )
}

export default App