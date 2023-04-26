import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useSpring, animated } from "react-spring";
import styles from "@/styles/Home.module.css";

const PuzzleArea = () => {
  const [droppedPieces, setDroppedPieces] = useState([]);
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const pieceRefs = useRef(new Map());

  useEffect(() => {
    if (hoveredPiece) {
      console.log(hoveredPiece);
      console.log(
        `ドラッグ中のピースがピース${hoveredPiece.piece}の上に重なっています。相対座標: X=${hoveredPiece.relativeX}, Y=${hoveredPiece.relativeY}`
      );
    } else {
      console.log("ドラッグ中のピースがdroppedPiecesの上に重なっていません。");
    }
    console.log(droppedPieces);
  }, [hoveredPiece]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "piece",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      checkHoveredPiece(clientOffset);
      console.log(item);
      setDroppedPieces((prev) => [...prev, item.id]);
      console.log(`ドロップ: ピース${item.id}`);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const checkHoveredPiece = (clientOffset) => {
    const entries = Array.from(pieceRefs.current.entries());
    const foundEntry = entries.find(([_, ref]) => {
      const rect = ref.getBoundingClientRect();
      return (
        clientOffset.x >= rect.left &&
        clientOffset.x <= rect.right &&
        clientOffset.y >= rect.top &&
        clientOffset.y <= rect.bottom
      );
    });

    if (foundEntry) {
      const [piece, ref] = foundEntry;
      const rect = ref.getBoundingClientRect();
      const relativeX = clientOffset.x - rect.left;
      const relativeY = clientOffset.y - rect.top;
      console.log(piece);
      console.log("check");
      setHoveredPiece({ piece, relativeX, relativeY });
    } else {
      setHoveredPiece(null);
    }
  };

  const springProps = useSpring({
    backgroundColor: isOver ? "lightblue" : "white",
    transform: `scale(${isOver ? 1.05 : 1})`,
  });
  return (
    <animated.div
      ref={drop}
      className={styles["puzzle-area"]}
      style={springProps}
    >
      組み立てエリア
      {droppedPieces.map((piece, index) => (
        <div
          ref={(el) => pieceRefs.current.set(piece, el)}
          key={index}
          className={styles["dropped-piece"]}
        >
          ピース{piece}
        </div>
      ))}
    </animated.div>
  );
};
export default PuzzleArea;
