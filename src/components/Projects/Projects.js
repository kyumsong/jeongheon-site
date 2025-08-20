import uniqid from 'uniqid'
import { projects } from '../../portfolio'
import './Projects.css'

const Projects = () => {
  if (!projects.length) return null

  return (
    <section className='section projects' id='projects'>
      <h2 className='section__title'>학력</h2>
      <ul className='projects__list'>
        {projects.map((skill) => (
          <li key={uniqid()} className='skills__list-item btn btn--plain'>
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Projects
