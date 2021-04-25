import Stage from 'components/stage/PersistedStage'
import Terminal from 'components/sh/Terminal'
import Head from 'next/head'
import { CoreVar } from 'model/sh/var.model'
import { profiles } from 'model/sh/code-library'
import styles from 'styles/Home.module.css'

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>rsrm</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Birdseye CLI
        </h1>
        <p className={styles.subtitle}>
          Interactive <a target='#' href='https://threejs.org/'>three.js</a> from a topdown perspective.
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
