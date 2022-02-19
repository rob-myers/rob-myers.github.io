/** @param {React.PropsWithChildren<Props>} props */
export default function CssPanZoom(props) {
  return (
    <div>
      {props.children}
    </div>
  )
}

/**
 * @typedef Props @type {object}
 * @property {string} [className]
 */
