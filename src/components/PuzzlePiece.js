import React from "react";
import { useDrag } from "react-dnd";
import styles from "@/styles/Home.module.css";

const PuzzlePiece = ({ piece }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: piece.type,
    item: { id: piece.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={styles["puzzle-piece"]}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      ピース{piece.id}
    </div>
  );
};

export default PuzzlePiece;
