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

  //   const [{ isOver }, drop] = useDrop(() => ({
  //     accept: "piece",
  //     drop: (item, monitor) => {
  //       const clientOffset = monitor.getClientOffset();
  //       checkHoveredPiece(clientOffset);
  //       console.log(hoveredPiece);
  //       console.log("ドロップしたピースを出力");
  //       console.log(item);
  //       setDroppedPieces((prev) => [...prev, item.id]);
  //       console.log(`ドロップ: ピース${item.id}`);
  //     },
  //     collect: (monitor) => ({
  //       isOver: monitor.isOver(),
  //     }),
  //   }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "piece",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const hoveredPiece = checkHoveredPiece(clientOffset);

      console.log("重なっていたピースを出力", hoveredPiece);
      console.log("ドロップしたピースを出力", item);

      if (hoveredPiece) {
        const pieceWidth = 94; // ピースの横幅
        const insertBefore = hoveredPiece.relativeX <= pieceWidth / 2;
        console.log(insertBefore, "insertBefore");

        setDroppedPieces((prev) => {
          const index = prev.findIndex((piece) => piece === hoveredPiece.piece);

          // 新しい配列を作成し、ドロップされたピースを適切な位置に挿入する
          const newPieces = [...prev];
          if (insertBefore) {
            newPieces.splice(index, 0, item.id);
          } else {
            newPieces.splice(index + 1, 0, item.id);
          }

          return newPieces;
        });
      } else {
        setDroppedPieces((prev) => [...prev, item.id]);
      }

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
      return { piece, relativeX, relativeY };
    } else {
      return null;
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
      <div className={styles["puzzle-pieces-row"]}>
        {droppedPieces.map((piece, index) => (
          <div
            ref={(el) => pieceRefs.current.set(piece, el)}
            key={index}
            className={styles["dropped-piece"]}
          >
            ピース{piece}
          </div>
        ))}
      </div>
    </animated.div>
  );
};
export default PuzzleArea;
