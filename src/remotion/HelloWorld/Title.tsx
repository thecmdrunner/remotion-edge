import { interpolate } from "@/lib/utils/interpolate";

export const Title: React.FC<{
  titleText: string;
  titleColor: string;
  frame: number;
}> = ({ titleText, titleColor, frame }) => {
  const opacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        opacity,
        color: titleColor,
        fontWeight: "bold",
        lineHeight: 1,
        fontSize: "3rem",
      }}
    >
      {titleText}
    </div>
  );
};
