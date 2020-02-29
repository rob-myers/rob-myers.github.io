import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { Terminal } from 'xterm';
import { Thunk } from '@store/xterm.duck';

// import { redact } from '@model/redux.model';
// import XTermComponent from './xterm';

// /**
//  * Assume a new session is created/destroyed on mount/unmount.
//  */

// // import { DispatchOverload, thunkDispatcher } from '@src/store/thunk.middleware';
// // import { OsPanelMetaKey } from '@model/os/os.model';

// // import {
// //   osCreateSessionThunk,
// //   setSessionPanelMetasThunk
// // } from '@store/os/session.os.duck';

export const Session: React.FC<Props> = ({ uid, userName }) => {
  const dispatch = useDispatch();
  const { xterm } = useSelector((state) => state);
  const state = xterm.instance[uid];

  console.log({ state, userName });

  useEffect(() => {
    dispatch(Thunk.ensureGlobalSetup({}));
    /**
     * TODO trigger osCreateSessionThunk via message
     */
    // dispatch(osCreateSessionThunk)

    // const { sessionKey } = this.props.createSession({
    //   // Needed to track panel closure via UI.
    //   panelKey: this.props.panelKey,
    //   userKey: this.props.userName,
    //   xterm: redact(xterm),
    // }, []);
    // dispatch(Act.registerInstance({ key: uid, sessionKey }));
    return () => {
      // Close session ?
      // dispatch(Act.unregisterInstance(uid));
    };
  }, []);

  return null;
  //   return (
  //     <XTermComponent
  //       // Truthy iff resuming pre-existing session.
  //       resume={this.props.xterm}
  //       options={{
  //         fontSize: 12,
  //         cursorBlink: true,
  //         // bellStyle: 'sound',
  //         // bellSound: beep29DataUri,
  //         rendererType: 'dom',
  //         theme: {
  //           background: 'black',
  //           foreground: '#41FF00',
  //         },
  //       }}
  //       resizedAt={this.props.resizedAt}
  //       addons={['fit', 'fullscreen', 'search', 'webLinks']}
  //       onMount={(xterm: Terminal) => {

  //         // Initialize plugins.
  //         xterm.fit();
  //         xterm.webLinksInit();

  //         if (!this.props.xterm) {// Not resuming.
  //           try {
  //             // Create a new login session.
  //             const { sessionKey } = this.props.createSession({
  //               // Needed to track panel closure via UI.
  //               panelKey: this.props.panelKey,
  //               userKey: this.props.userName,
  //               xterm: redact(xterm)
  //             });

//             this.props.setPanelMetas({
//               panelKey: this.props.panelKey,
//               panelMeta: {
//                 sessionKey,// Store session key in panel.
//                 title: sessionKey,// Set title.
//               },
//             });
//           } catch (e) {
//             console.error(e);
//           }
//         }
//       }}
//     />
//   );
};

interface Props {
  /** User name to login with. */
  userName: string;
  /** If other UI closes this, we can tidy away session. */
  uid: string;
}

// // class Session extends React.Component<Props> {

// //   constructor(props: Props, context?: any) {
// //     super(props, context);  
// //   }

// //   public render() {
// //     return (
// //       <XTermComponent
// //         // Truthy iff resuming pre-existing session.
// //         resume={this.props.xterm}
// //         options={{
// //           fontSize: 12,
// //           cursorBlink: true,
// //           // bellStyle: 'sound',
// //           // bellSound: beep29DataUri,
// //           rendererType: 'dom',
// //           theme: {
// //             background: 'black',
// //             foreground: '#41FF00',
// //           },
// //         }}
// //         resizedAt={this.props.resizedAt}
// //         addons={['fit', 'fullscreen', 'search', 'webLinks']}
// //         onMount={(xterm: XTermTerminal) => {

// //           // Initialize plugins.
// //           xterm.fit();
// //           xterm.webLinksInit();

// //           if (!this.props.xterm) {// Not resuming.
// //             try {
// //               // Create a new login session.
// //               const { sessionKey } = this.props.createSession({
// //                 // Needed to track panel closure via UI.
// //                 panelKey: this.props.panelKey,
// //                 userKey: this.props.userName,
// //                 xterm: Object.assign<XTermTerminal, RedactInReduxDevTools>(
// //                   xterm, { devToolsRedaction: 'XTerm.Terminal' },
// //                 ),
// //               });

// //               this.props.setPanelMetas({
// //                 panelKey: this.props.panelKey,
// //                 panelMeta: {
// //                   sessionKey,// Store session key in panel.
// //                   title: sessionKey,// Set title.
// //                 },
// //               });
// //             } catch (e) {
// //               console.error(e);
// //             }
// //           }
// //         }}
// //       />
// //     );
// //   }
// // }

// // interface OwnProps {
// //   /** User name to login with. */
// //   userName: string;
// //   /** Parent panel identifier. */
// //   panelKey: string;
// // }


// // /**
// //  * Mounting {XTermComponent} (see below) creates a session and stores {sessionKey} in parent panel.
// //  * We retreive it via {mapStateToProps}, and also {guiKey}, {xterm}.
// //  */
// // function mapStateToProps(
// //   { layout: { panel }, os: { session }}: RootState,
// //   { panelKey }: OwnProps,
// // ) {
// //   const { sessionKey } = panel[panelKey].panelMeta as LayoutPanelMeta<OsPanelMetaKey>;
// //   return {
// //     sessionKey: sessionKey || null,
// //     /** On change `guiKey` we'll display respective GUI e.g. monaco editor. */
// //     guiKey: sessionKey ? session[sessionKey].guiKey : null,
// //     /** On panel resized we'll resize 3rd party `xterm`. */
// //     xterm: sessionKey ? session[sessionKey].xterm : null,
// //     resizedAt: panel[panelKey].resizedAt,
// //   };
// // }

// // function mapDispatchToProps(dispatch: DispatchOverload) {
// //   return {
// //     createSession: thunkDispatcher(dispatch, osCreateSessionThunk),
// //     setPanelMetas: thunkDispatcher(dispatch, setSessionPanelMetasThunk),
// //   };
// // }

// // type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

// // export default connect(
// //   mapStateToProps,
// //   mapDispatchToProps,
// //   // null,
// //   // { withRef: true },
// // )(Session);
