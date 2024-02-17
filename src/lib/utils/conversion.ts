import { toPng } from "html-to-image";
import { type RefObject } from "react";

export async function handleSetImage(
  ref: RefObject<HTMLElement>,
  mainRef: RefObject<HTMLElement>,
) {
  if (!ref.current) {
    alert("not ready yet?");
    return;
  }
  const url = await toPng(ref.current);

  const newimg = new Image();

  newimg.src = url;

  mainRef.current!.appendChild(newimg);
}
