"use client"
import { useEffect, useState } from "react"
import styles from "./animated-travel-background.module.css"

export default function AnimatedTravelBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className={styles.animatedBackground}>
      <div className={styles.sky}>
        {/* Clouds */}
        <div className={`${styles.cloud} ${styles.cloud1}`}></div>
        <div className={`${styles.cloud} ${styles.cloud2}`}></div>
        <div className={`${styles.cloud} ${styles.cloud3}`}></div>
        <div className={`${styles.cloud} ${styles.cloud4}`}></div>

        {/* Improved Airplanes */}
        <div className={`${styles.airplane} ${styles.airplane1}`}>
          <div className={styles.head}></div>
          <div className={styles.body}>
            <div className={styles.window}></div>
            <div className={styles.window}></div>
            <div className={styles.window}></div>
          </div>
          <div className={styles.lwing}></div>
          <div className={styles.rwing}></div>
          <div className={styles.tale}></div>
        </div>

        <div className={`${styles.airplane} ${styles.airplane2}`}>
          <div className={styles.head}></div>
          <div className={styles.body}>
            <div className={styles.window}></div>
            <div className={styles.window}></div>
            <div className={styles.window}></div>
          </div>
          <div className={styles.lwing}></div>
          <div className={styles.rwing}></div>
          <div className={styles.tale}></div>
        </div>
      </div>

      <div className={styles.ground}>
        {/* Road */}
        <div className={styles.road}>
          <div className={styles.roadLine}></div>
        </div>

        {/* Cars */}
        <div className={`${styles.car} ${styles.car1}`}>
          <div className={styles.carBody}></div>
          <div className={styles.carWindow}></div>
          <div className={styles.carWheel1}></div>
          <div className={styles.carWheel2}></div>
        </div>
        <div className={`${styles.car} ${styles.car2}`}>
          <div className={styles.carBody}></div>
          <div className={styles.carWindow}></div>
          <div className={styles.carWheel1}></div>
          <div className={styles.carWheel2}></div>
        </div>
      </div>
    </div>
  )
}
