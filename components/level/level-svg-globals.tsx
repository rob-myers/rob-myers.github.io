export const LevelSvgGlobals: React.FC = () => (
  <>
    <filter id="svg-shadow-nw" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.1"/>
      <feOffset dx="-0.1" dy="-0.1" result="offsetblur"/>
      <feMerge> 
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="svg-shadow-ne" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.1"/>
      <feOffset dx="0.1" dy="-0.1" result="offsetblur"/>
      <feMerge> 
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </>
);

export default LevelSvgGlobals;