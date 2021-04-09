import Stage from 'components/stage/Stage'
import Terminal from 'components/sh/Terminal'
import Head from 'next/head'
import { CoreVar } from 'model/sh/var.model'
import { profiles } from 'model/sh/code-library'
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
          {/* <span className={styles.reference}>
            <a href="https://makegames.tumblr.com/post/1136623767/finishing-a-game" target='#'>
              [1]
            </a>
          </span> */}
        </h1>
        <p className={styles.subtitle}>
          <em>Programming human behaviour</em>
        </p>

        <section className={styles.termStage}>
          <Stage stageKey="test" />
          <Terminal
            sessionKey="demo"
            env={{
              [CoreVar.STAGE_KEY]: "test",
              [CoreVar.PROFILE]: profiles.first,
            }}
          />
        </section>
      </main>
    </>
  )
}
