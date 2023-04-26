import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PuzzleArea from "./PuzzleArea";
import PuzzlePiece from "./PuzzlePiece";
import styles from "@/styles/Home.module.css";

const pieces = [
  { id: 1, type: "piece" },
  { id: 2, type: "piece" },
  { id: 3, type: "piece" },
  { id: 4, type: "piece" },
  { id: 5, type: "piece" },
  { id: 6, type: "piece" },
];

const PuzzleGame = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className={styles["puzzle-pieces-area"]}>
          {pieces.map((piece) => (
            <PuzzlePiece key={piece.id} piece={piece} />
          ))}
        </div>
        <PuzzleArea />
      </div>
    </DndProvider>
  );
};

export default PuzzleGame;
