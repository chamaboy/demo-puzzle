import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { useSpring, animated } from "react-spring";
import styles from "@/styles/Home.module.css";

const DropHint = ({ position }) => {
  const style = position ? { top: position.y, left: position.x } : {};

  return <div className={styles["drop-hint"]} style={style} />;
};

const PuzzleArea = () => {
  const [hoveredPiece, setHoveredPiece] = useState(null);
  const [piecesRows, setPiecesRows] = useState([[]]);
  const pieceRefs = useRef(new Map());
  const [hintPosition, setHintPosition] = useState(null);

  useEffect(() => {
    if (hoveredPiece) {
      console.log(
        `ドラッグ中のピースがピース${hoveredPiece.piece}の上に重なっています。相対座標: X=${hoveredPiece.relativeX}, Y=${hoveredPiece.relativeY}`
      );
    } else {
      console.log("ドラッグ中のピースがdroppedPiecesの上に重なっていません。");
    }

    if (hoveredPiece) {
      const hoveredEl = pieceRefs.current.get(hoveredPiece.piece);
      if (hoveredEl) {
        const rect = hoveredEl.getBoundingClientRect();
        setHintPosition({
          x: rect.right,
          y: rect.top,
        });
      }
    } else {
      setHintPosition({
        x: 0, // 左上隅のX座標
        y: 0, // 左上隅のY座標
      });
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
        console.log(hoveredPiece, "ピースが重なっていません");

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
        console.log(prev);
        console.log(hoveredPiece.piece);
        const [rowIndexStr, piece] = hoveredPiece.piece.split("_");
        const rowIndex = parseInt(rowIndexStr, 10);

        const index = prev[rowIndex].findIndex((pieceId) => {
          const pieceNumber = parseInt(piece, 10);
          return pieceId === pieceNumber;
        });

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
    console.log(entries);
    const foundEntry = entries.find(([_, ref]) => {
      console.log("ref", ref);
      const rect = ref.getBoundingClientRect();
      console.log(clientOffset);
      console.log(rect);
      return (
        clientOffset.x >= rect.left &&
        clientOffset.x <= rect.right &&
        clientOffset.y >= rect.top &&
        clientOffset.y <= rect.bottom
      );
    });

    console.log(foundEntry);

    if (foundEntry) {
      const [piece, ref] = foundEntry;
      const rect = ref.getBoundingClientRect();
      const relativeX = clientOffset.x - rect.left;
      const relativeY = clientOffset.y - rect.top;
      return { piece, relativeX, relativeY };
    } else {
      console.log("hoverdPieceがnull");
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
    <animated.div ref={drop} className={styles["puzzle-area"]}>
      {piecesRows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles["puzzle-pieces-row"]}>
          {row.map((piece, index) => (
            <div
              ref={(el) => {
                if (el) {
                  pieceRefs.current.set(`${rowIndex}_${piece}`, el);
                } else {
                  pieceRefs.current.delete(`${rowIndex}_${piece}`);
                }
              }}
              key={index}
              className={styles["dropped-piece"]}
            >
              ピース{piece}
            </div>
          ))}
          {isOver && <DropHint position={hintPosition} />}
        </div>
      ))}
      {isOver && piecesRows[0].length ? (
        <DropHint position={hintPosition} />
      ) : null}
    </animated.div>
  );
};
export default PuzzleArea;
