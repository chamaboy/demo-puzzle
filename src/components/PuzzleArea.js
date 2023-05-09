import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useSpring, animated } from "react-spring";
import styles from "@/styles/Home.module.css";

const PuzzleArea = () => {
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const [piecesRows, setPiecesRows] = useState([[]]);
  const pieceRefs = useRef(new Map());

  useEffect(() => {
    if (hoveredPiece) {
      console.log(
        `ドラッグ中のピースがピース${hoveredPiece.piece}の上に重なっています。相対座標: X=${hoveredPiece.relativeX}, Y=${hoveredPiece.relativeY}`
      );
    } else {
      console.log("ドラッグ中のピースがdroppedPiecesの上に重なっていません。");
    }
  }, [hoveredPiece]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "piece",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const hoveredPiece = checkHoveredPiece(clientOffset);

      console.log("重なっていたピースを出力", hoveredPiece);
      console.log("ドロップしたピースを出力", item);

      if (!hoveredPiece) {
        console.log("ピースが重なっていません");

        setPiecesRows((prev) => {
          const newRow = [...prev];
          newRow[0] = [...prev[0], item.id];
          return newRow;
        });
        return;
      }

      const pieceWidth = 100; // ピースの横幅
      const { relativeX, relativeY } = hoveredPiece;
      const isInRangeX = 20 <= relativeX && relativeX < 70;
      const isInRangeYTop = 0 <= relativeY && relativeY < 20;
      const isInRangeYCenter = 20 <= relativeY && relativeY < 50;
      const isInRangeYBottom = 50 <= relativeY && relativeY < 70;

      const insertLeft = isInRangeYCenter && relativeX < pieceWidth / 2;
      const insertRight = isInRangeYCenter && relativeX >= pieceWidth / 2;
      const insertTop = isInRangeX && isInRangeYTop;
      const insertBottom = isInRangeX && isInRangeYBottom;

      setPiecesRows((prev) => {
        const rowIndex = prev.findIndex((row) =>
          row.includes(hoveredPiece.piece)
        );
        const index = prev[rowIndex].findIndex(
          (piece) => piece === hoveredPiece.piece
        );

        console.log("rowIndex", rowIndex);
        console.log("index", index);

        let newRow = [...prev];

        if (insertTop || insertBottom) {
          const insertIndex = insertTop ? rowIndex : rowIndex + 1;
          console.log(insertIndex);
          console.log(insertTop, "上に配置する");
          console.log(insertBottom, "下に配置する");
          newRow.splice(insertIndex, 0, [item.id]);
          return newRow;
        }

        const newPieces = [...prev[rowIndex]];

        const insertColIndex = insertLeft ? index : index + 1;
        console.log(insertColIndex);
        console.log(insertLeft, "左に配置する");
        console.log(insertRight, "右に配置する");
        newPieces.splice(insertColIndex, 0, item.id);

        newRow[rowIndex] = newPieces;

        return newRow;
      });

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

    console.log(entries);
    console.log(foundEntry);

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

  useEffect(() => {
    console.log(piecesRows);
  }, [piecesRows]);
  return (
    <animated.div
      ref={drop}
      className={styles["puzzle-area"]}
      style={springProps}
    >
      {piecesRows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles["puzzle-pieces-row"]}>
          {row.map((piece, index) => (
            <div
              ref={(el) => pieceRefs.current.set(piece, el)}
              key={index}
              className={styles["dropped-piece"]}
            >
              ピース{piece}
            </div>
          ))}
        </div>
      ))}
    </animated.div>
  );
};
export default PuzzleArea;
