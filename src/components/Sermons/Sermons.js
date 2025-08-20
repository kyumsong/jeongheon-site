const YOUTUBE_CHANNEL_URL = 'https://youtube.com/@pastor.song-f3h?si=655PcG6fYFoVQdB_'

const Sermons = () => (
  <section className='section sermons' id='sermons'>
    <h2 className='section__title'>설교</h2>
    <div style={{ textAlign: 'center', margin: '2em 0' }}>
      <a
        href={YOUTUBE_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '1em 2em',
          background: '#FF0000',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '1.2em'
        }}
      >
        YouTube 채널 바로가기
      </a>
    </div>
  </section>
)

export default Sermons