import type { CSSProperties, ReactNode } from "react";

export const AbsoluteFill = (props: {
  children?: ReactNode;
  style?: CSSProperties;
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};
