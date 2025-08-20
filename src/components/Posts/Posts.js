import { useHistory } from 'react-router-dom'

const Posts = () => {
  const history = useHistory()
  const handleClick = () => {
    history.push('/posts')
  }

  return (
    <section className='section posts' id='posts'>
      <h2 className='section__title'>글모음</h2>
      <div style={{ textAlign: 'center', margin: '2em 0' }}>
        <button
          type="button"
          onClick={handleClick}
          style={{
            display: 'inline-block',
            padding: '1em 2em',
            background: '#007bff',
            color: '#fff',
            border: '1px solid #007bff',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '1.2em',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          글모음 페이지로 이동
        </button>
      </div>
    </section>
  )
}

export default Posts