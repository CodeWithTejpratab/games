import React, { useState, useRef } from "react";
import { AppButton, HintButton } from "./Components";
import "./App.css";
import { SOLUTIONS } from "./solutions";
import {
  findSmallestWordLength,
  findLargestWordLength,
  saveUserHistoryForToday,
  getUserHistoryForToday,
  getGameNumber,
  createInitialGrid,
  shuffleGrid,
  removeExcessStars,
} from "./utils";

import SuperFunky from "./fonts/SuperFunky.ttf";
import cat from './cat.jpg';

function App() {
  const gameNumber = getGameNumber();
  let solution;
  if (SOLUTIONS.hasOwnProperty(gameNumber)) {
    solution = SOLUTIONS[gameNumber];
  } else {
    let valuesArray = Object.values(SOLUTIONS);
    solution = valuesArray[Math.floor(Math.random() * valuesArray.length)];
  }
  const words = solution["answer"];
  const hint = solution["hint"];
  const smallestLength = findSmallestWordLength(words);
  const largestLength = findLargestWordLength(words);

  // State variables
  const copyTextRef = useRef(null);
  const [guessEnabled, setGuessEnabled] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [guessBox, setGuessBox] = useState(Array(largestLength).fill("*"));
  const [textCopied, setTextCopied] = useState(false);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [guessCount, setGuessCount] = useState(0); // New state variable for guess count

  const history = getUserHistoryForToday();
  const [grid, setGrid] = useState(
    history?.["grid"] || createInitialGrid(words)
  );
  const [guessedWords, setGuessedWords] = useState(
    history?.["guessedWords"] ||
      words.map((word) => Array(word.length).fill(""))
  );
  const [wordBank, setWordBank] = useState(history?.["wordBank"] || []);
  const [attempts, setAttempts] = useState(history?.["attempts"] || []);
  const [finishedGame, setFinishedGame] = useState(
    history?.["finishedGame"] || false
  );
  const [hardMode, setHardMode] = useState(history?.["hardMode"] || true);

  const handleGuess = () => {
    makeGuess();
  };

  const handleShuffle = () => {
    const newGrid = shuffleGrid([...grid]);
    setGrid(newGrid);
    saveUserHistoryForToday("grid", newGrid);
  };

  const handleCopyToClipboard = () => {
    if (copyTextRef.current) {
      const hiddenTextArea = document.createElement("textarea");
      const yaas = "✅";
      const nooo = "❌";
      const strikes = attempts
        .map((attempt) => (attempt ? yaas : nooo))
        .join("");
      hiddenTextArea.value = `Save the Cookie Monster #${gameNumber}${hardMode ? `*` : ""}\n${strikes}\n\nhttps://codewithtejpratab.github.io/games/`;
      document.body.appendChild(hiddenTextArea);
      hiddenTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(hiddenTextArea);
      setTextCopied(true);
    }
  };

  const revealWord = (guess) => {
    const wordIndex = words.findIndex((word) => word.startsWith(guess));
    const updatedGuessedWords = [...guessedWords];
    updatedGuessedWords[wordIndex] = words[wordIndex].split("");
    setGuessedWords(updatedGuessedWords);
    saveUserHistoryForToday("guessedWords", updatedGuessedWords);

    const updatedGrid = grid.map((row) =>
      row.map((entry) => {
        if (selectedLetters.includes(entry["id"])) {
          return { id: entry["id"], value: "*" };
        } else {
          return entry;
        }
      })
    );

    const removedStars = removeExcessStars(updatedGrid);

    setGrid(shuffleGrid(removedStars));
    setSelectedLetters([]);
    saveUserHistoryForToday("grid", removedStars);

    if (
      updatedGuessedWords.every((word) => word.every((letter) => letter !== ""))
    ) {
      setFinishedGame(true);
      saveUserHistoryForToday("finishedGame", true);
    }
  };

  const revealLetters = (guess) => {
    let guessedLetters = guess;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const guessStatus = guessedWords[i];
      for (let j = 0; j < word.length; j++) {
        if (guessStatus[j] === "" && guessedLetters.includes(word[j])) {
          const indexToRemove = guessedLetters.indexOf(word[j]);
          guessedLetters =
            guessedLetters.slice(0, indexToRemove) +
            guessedLetters.slice(indexToRemove + 1);
          guessedWords[i][j] = word[j];
        }
      }
    }
    setGuessedWords(guessedWords);
    setSelectedLetters([]);
    saveUserHistoryForToday("guessedWords", guessedWords);
  };

  const makeGuess = () => {
    const input = userInput.toLowerCase();
    if (guessCount >= 5) {
      // User has exceeded guess limit
      // You can add further actions here, like showing a message to the user
      return;
    }
    setGuessCount(guessCount + 1); // Increment guess count
    if (words.includes(input)) {
      // case where the user made a correct guess
      setAttempts([...attempts, true]);
      saveUserHistoryForToday("attempts", [...attempts, true]);
      // update guessed words
      revealWord(input);
    } else {
      // case where the user made an incorrect guess
      setAttempts([...attempts, false]);
      saveUserHistoryForToday("attempts", [...attempts, false]);
      setWordBank([...wordBank, input]);
      saveUserHistoryForToday("wordBank", [...wordBank, input]);
      revealLetters(input);
    }
    setUserInput("");
    setGuessBox(Array(largestLength).fill("*"));
  };

  const onLetterClick = (letter) => {
    if (guessBox.slice(-1)[0] === "*") {
      setSelectedLetters([...selectedLetters, letter["id"]]);
      const newGuess = userInput + letter["value"];
      setUserInput(newGuess);
      let newGuessBox = guessBox;
      for (let i = 0; i < newGuess.length; i++) {
        newGuessBox[i] = newGuess[i];
      }
      setGuessBox(newGuessBox);
      if (
        newGuess.length >= smallestLength &&
        newGuess.length <= largestLength
      ) {
        setGuessEnabled(true);
      } else {
        setGuessEnabled(false);
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1
          style={{
            fontSize: "2.5em",
            marginBottom: "0px",
            fontFamily: "SuperFunky",
            src: `url(${SuperFunky}) format('truetype')`,
            textShadow: "2px 2px 4px #000080",
          }}
        >
          Save the Coookie Monster
        </h1>
        
        {guessCount >= 5 && !finishedGame && (
  <div>
    <h2>Game Over!</h2>
    <p>Sorry, you have reached the maximum number of guesses.</p>
    <p>Try again later!</p>
  </div>
)}
        {!finishedGame && guessCount < 5 ? (
          <>
           <div className="container">
              {/* Image */}
              <img src={cat} alt="Placeholder" className="me"/>
              <p>
               Whiskey is a wanted cat 🐱 all around Cat City for stealing cookies🍪. Because of that he has been given the name Cookie Monster. 
               The meow corp is hot 🔥on his paws🐾. If he is caught he'll be sentenced for life in Meow Pound🚔.
                <strong>     
                  Hurry! Solve the puzzle 🧩 to save the Cookie Monster!
                </strong>
              </p>
          </div> 
            {/* Hints */}
            <HintButton hint={hint} setHardMode={setHardMode} />
            {/* Guesses */}
            <h3 style={{ marginBottom: "0px" }}>
              Guess:{" "}
              <span style={{ fontSize: "24px" }}>
                {attempts.map((attempt) => (attempt ? "✅" : "❌"))}
              </span>
            </h3>
            <div>
              <span style={{ fontSize: "18px" }}>
                <b>Poor guess:</b> {wordBank.join(", ")}{" "}
                {wordBank.length === 0 && "Fresh Start!"}
              </span>
            </div>
            <div style={{ marginBottom: "8px" }}>
              {guessedWords.map((word, wordIndex) => {
                const guesses = word.map((letter, letterIndex) => {
                  return (
                    <span key={`${wordIndex}_${letterIndex}`}>
                      {letter.length > 0 ? `${letter} ` : "_ "}
                    </span>
                  );
                });
                return (
                  <>
                    {guesses}
                    <br />
                  </>
                );
              })}
            </div>
            <div>
              {guessBox.map((entry, entryId) => (
                <div
                  key={entryId}
                  style={{
                    display: "inline-block",
                    backgroundColor: entry === "*" ? "transparent" : "#4F7942",
                    border: entry === "*" ? "2px solid black" : "none",
                    width: `${Math.min(window.innerWidth / (largestLength + 3), 45)}px`,
                    height: `${Math.min(window.innerWidth / (largestLength + 3), 45)}px`,
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Futura, sans-serif",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    margin: "4px",
                    fontSize: "xx-large",
                    color: entry === "*" ? "transparent" : "white",
                  }}
                >
                  {entry === "*" ? "*" : entry}
                </div>
              ))}
            </div>
            {/* Grid */}
            <div style={{ marginTop: "16px" }}>
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex" }}>
                  {row.map((entry) => (
                    <div
                      key={entry["id"]}
                      style={{
                        backgroundColor: "white",
                        width: `50px`,
                        height: `50px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Futura, sans-serif",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        margin: "4px",
                        cursor: entry["value"] === "*" ? "click" : "pointer",
                        fontSize: "xx-large",
                        color:
                          entry["value"] === "*"
                            ? "white"
                            : selectedLetters.includes(entry["id"])
                              ? "#50C878" // light grey
                              : "black",
                      }}
                      onClick={() =>
                        entry["value"] !== "*" &&
                        !selectedLetters.includes(entry["id"]) &&
                        onLetterClick(entry)
                      }
                    >
                      {entry["value"]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: "flex" }}>
              <AppButton onClick={handleShuffle} text="Shuffle" />{" "}
              <AppButton
                onClick={() => {
                  setUserInput("");
                  setGuessBox(Array(largestLength).fill("*"));
                  setSelectedLetters([]);
                }}
                text="Clear"
              />{" "}
              <AppButton
                onClick={handleGuess}
                disabled={!guessEnabled}
                text="Guess"
              />
            </div>
          </>
        ) : (
          // Finished board
          <>
            <h3 style={{ marginBottom: "0px" }}>
              Looks like you saved the Cookie Monster!
            </h3>
            <p style={{ marginBottom: "0px" }}>
              Save-The-Cookie-Monster {gameNumber}
              {hardMode && "*"}{" "}
              <span style={{ fontSize: "24px" }}>
                {attempts.map((attempt) => (attempt ? "✅" : "❌"))}
              </span>
            </p>
            <p style={{ fontSize: "18px" }}>
              {textCopied &&
                "Result copied to keyboard, now paste and share with friends!"}
            </p>
            <AppButton
              onClick={handleCopyToClipboard}
              text="Share with Friends"
            />
            <div style={{ display: "none" }}>
              <textarea ref={copyTextRef} readOnly />
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
