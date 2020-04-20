export const LevelSvgGlobals: React.FC = () => (
  <>
    <filter id="svg-shadow-all">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.1"/>
      <feOffset dx="-0.1" dy="-0.1" result="a" />
      <feOffset dx="0.25" dy="0.25" in="a" result="b" />
      <feMerge> 
        <feMergeNode in="a" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </>
);

export default LevelSvgGlobals;