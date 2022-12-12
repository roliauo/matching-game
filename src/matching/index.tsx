import React, { useState, useRef, useEffect, useMemo } from "react";
import "./style.scss";

const MODE = {
  START: "START",
  PLAYING: "PLAYING",
  END: "END"
};

const PLAY_TIME = 20;
const READY_TIME_MS = 2000;
const cardsSample = ["red", "yellow", "olivedrab", "pink", "orange"];
const cardsAll = cardsSample.concat(cardsSample);

// DONE: matched cards should not clickable.
// DONE: matched cards should keep back face.

/*
 * Fisher–Yates shuffle
 */
function shuffle(arr: string[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export default function Matching() {
  const [cardsOrder, setCardsOrder] = useState<string[]>(cardsAll);
  const [mode, setMode] = useState<string>(MODE.END);
  const [time, setTime] = useState<number>(PLAY_TIME);
  const [score, setScore] = useState<number>(0);

  const [selectedIndex, setSelectedIndex] = useState<number>();
  const cardRef = useRef<any[]>([]);
  let timer = useRef<any>();

  function backFace() {
    cardRef.current.map((el) => el.classList.add("reverse", "stop"));
  }

  function frontFace() {
    cardRef.current.map((el) => el.classList.remove("reverse", "stop"));
  }

  function start() {
    shuffle(cardsOrder);
    setCardsOrder([...cardsOrder]);
    backFace();
    setTime(PLAY_TIME);
    setScore(0);
    setSelectedIndex(undefined);
    setMode(MODE.START);
  }

  function gameOver() {
    setMode(MODE.END);
    backFace();
  }

  function countdown() {
    timer.current = setInterval(() => {
      setTime(time - 1);
    }, 1000);
  }

  function handleClick(e: { target: HTMLDivElement }, index: number) {
    if (mode !== MODE.PLAYING) return;

    e.target.classList.add("reverse");

    if (
      selectedIndex !== undefined &&
      index !== selectedIndex &&
      cardsOrder[index] === cardsOrder[selectedIndex]
    ) {
      // matched
      const selectedIndexCopy = selectedIndex;

      setTimeout(() => {
        e.target.classList.add("stop", "reverse");
        cardRef.current[selectedIndexCopy].classList.add("stop", "reverse");
      }, 1000);

      setSelectedIndex(undefined);
      setScore(score + 1);
    } else {
      // reset click
      setSelectedIndex(index);

      setTimeout(() => {
        e.target.classList.remove("stop", "reverse");
        if (selectedIndex !== undefined) {
          cardRef.current[selectedIndex].classList.remove("stop", "reverse");
        }
      }, 1000);
    }
  }

  useEffect(() => {
    if (mode === MODE.START && cardRef && cardRef.current) {
      setTimeout(() => {
        frontFace();
      }, READY_TIME_MS);
      setMode(MODE.PLAYING);
    }

    if (mode === MODE.PLAYING) {
      if (time === PLAY_TIME) {
        setTimeout(() => {
          countdown();
        }, READY_TIME_MS);
      } else {
        countdown();
      }

      if (time === 0) {
        gameOver();
      }
    }

    return () => {
      clearInterval(timer.current);
    };
  }, [mode, time]);

  useEffect(() => {
    if (score === cardsSample.length) {
      gameOver();
    }
  }, [score]);

  const cards = useMemo(
    () =>
      cardsOrder.map((v, i) => (
        <div
          className="card reverse"
          key={i}
          ref={(el) => (cardRef.current[i] = el)}
          onClick={(e) => handleClick(e, i)}
        >
          <div className="side front"></div>
          <div className="side back" style={{ backgroundColor: `${v}` }}>
            {v}
          </div>
        </div>
      )),
    [[...cardsOrder]]
  );

  return (
    <>
      <h3>{mode}</h3>
      <h4> time: {time} </h4>
      <h4> score: {score} </h4>
      <button onClick={start}> Start </button>
      <div className="flex">{cards}</div>
    </>
  );
}
