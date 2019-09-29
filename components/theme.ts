const purple60 = `#663399`;
const purple30 = `#D9BAE8`;
const black80 = `#1B1F23`;
const white = `#fff`;

const grey90 = `#232129`;
const lightWhite = `rgba(255, 255, 255, 0.86)`;
const opaqueLightWhite = `hsla(0, 0%, 100%, 0.2)`;

export default {
  initialColorMode: `light`,
  background: white,
  primary: purple60,
  secondary: black80,
  modes: {
    dark: {
      text: lightWhite,
      background: grey90,
      primary: purple30,
      secondary: lightWhite,
      muted: opaqueLightWhite,
      highlight: purple60,
      heading: white
    }
  }
};
