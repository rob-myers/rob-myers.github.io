import { useQuery } from "react-query";
import { assertNonNull } from "../service/generic";

/**
 * Augmented image
 * @param {Props & React.SVGProps<SVGImageElement>} props
 */
export default function AugImage(props) {

  const { data } = useQuery(`Image:${props.href}(${props.darkness || 0})`, async () => {
    // Copy image into canvas
    const image = new Image;
    const canvas = document.createElement('canvas');
    await new Promise((res, rej) => {
      image.src = props.href;
      image.onload = () => res(image);
      image.onerror = () => rej(new Error(`failed to load image: ${props.href}`));
    });
    [canvas.width, canvas.height] = [image.width, image.height];
    const ctxt = assertNonNull(canvas.getContext('2d'));
    ctxt.drawImage(image, 0, 0);

    // Darken TODO use props
    ctxt.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctxt.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL();
  });

  return (
    <image
      {...props}
      href={data}
    />
  );
}

/**
 * @typedef Props @type {object}
 * @property {string} href Location of original image
 * @property {number} [darkness] Make image darker
 */
