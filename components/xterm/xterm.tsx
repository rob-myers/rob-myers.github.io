// // https://github.com/farfromrefug/react-xterm/blob/master/src/react-xterm.tsx
// import * as React from 'react';
// import { Terminal, ITerminalOptions } from 'xterm';

// export interface Props extends React.DOMAttributes<{}> {
//   /**
//    * Can resume existing instance.
//    */
//   resume: null | Terminal;
//   addons: string[];
//   options?: ITerminalOptions;
//   style?: React.CSSProperties;
//   path?: string;
//   className?: string;
//   onMount: (xterm: Terminal) => void;
//   resizedAt: null | number;
// }

// class XTermComponent extends React.Component<Props> {

//   public xterm: Terminal | null = null;
//   public container: HTMLDivElement;
  
//   constructor(props: Props, context?: any) {
//     super(props, context);
//   }

//   public applyAddon(addon: any) {
//     Terminal.applyAddon(addon);
//   }

//   public componentDidMount() {
//     // console.log('did-mount');
//     if (this.props.addons) {
//       this.props.addons.forEach((basename) => {
//         const addon = require(
//           `xterm/dist/addons/${basename}/${basename}.js`
//         );
//         Terminal.applyAddon(addon);
//       });
//     }
//     if (this.props.resume) {
//       this.xterm = this.props.resume;
//       // Re-append to this component.
//       // Cursor-blink issue when reapplied `open`.
//       this.container.appendChild(this.xterm.element);
//       // this.xterm.focus();
//     } else {
//       this.xterm = new Terminal(this.props.options);
//       this.xterm.open(this.container);
//       // window.addEventListener('resize', () => this.xterm && (this.xterm as any).fit());
//     }
//     this.props.onMount(this.xterm);
//   }

//   public componentWillUnmount() {
//     if (this.xterm) {
//       /**
//        * Cannot this.xterm.{destroy,dispose} here, since may reuse.
//        * We'll destroy it in {endSessionThunk}.
//        */
//       if (this.xterm.element.parentElement) {
//         this.xterm.element.parentElement.removeChild(this.xterm.element);
//       }
//       this.xterm = null;
//     }
//   }

//   public componentWillReceiveProps({ resizedAt }: Props) {
//     if (resizedAt && (resizedAt !== this.props.resizedAt)) {
//       if (this.xterm) {
//         /**
//          * - Had issue on window resize i.e. text of terminal sometimes
//          *   disappeared. Reappeared on subsequent resize (not immediately).
//          * - Solved by altering golden-layout.patch i.e. on window resize
//          *   we now invoke `updateSize` inside a `setTimeout(-, 1)`.
//          */
//         (this.xterm as XTermTerminalWithPlugins).fit();
//       }
//     }
//   }

//   public render() {
//     return (
//       <div
//         ref={(ref) => (ref && (this.container = ref))}
//         className={this.props.className}
//         style={{ height: '100%', width: '100%' }}
//       />
//     );
//   }
// }

// export default XTermComponent;
