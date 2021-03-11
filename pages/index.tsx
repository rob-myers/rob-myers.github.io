import Stage from 'components/stage/Stage'
import Terminal from 'components/sh/Terminal'
import Head from 'next/head'
import styles from 'styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>rsrm</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Making the Damn Game
          <span className={styles.reference}>
            <a href="https://makegames.tumblr.com/post/1136623767/finishing-a-game" target='#'>
              [1]
            </a>
          </span>
        </h1>
        <p className={styles.subtitle}>
          inspired by <a href="https://en.wikipedia.org/wiki/Teleglitch" target='#'>
            Teleglitch
          </a>.
        </p>

        <section className={styles.termStage}>
          <Stage stageKey={'test'} />
          <Terminal sessionKey={'test'} />
        </section>
      </main>
    </>
  )
}
