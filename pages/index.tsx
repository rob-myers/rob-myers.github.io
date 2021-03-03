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
          Welcome
        </h1>

        <p>
          to this particular offering
        </p>

        <section className={styles.termStage}>
          <Terminal sessionKey={'test'} />
          <Stage stageKey={'test'} />
        </section>
      </main>
    </>
  )
}
