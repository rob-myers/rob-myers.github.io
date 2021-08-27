import { Poly, Vect } from "../geom";

export const octagon = new Poly([...Array(8)].map((_ ,i) => new Vect(
  Math.cos(2 * Math.PI * (1/16 + i/8)),
  Math.sin(2 * Math.PI * (1/16 + i/8)),
))).scale(50).round();

export const [hollowOctagon] = Poly.cutOut(
  [octagon],
  [octagon.clone().scale(60 / 40)],
);

export const [figureOfEight] = Poly.union([
  hollowOctagon,
  hollowOctagon.clone().translate(hollowOctagon.rect.width - 20, 0),
]);
figureOfEight.round();
