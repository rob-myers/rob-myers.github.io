/**
 * SVG definitions, see also EnvGrid.
 */
export const EnvDefs: React.FC = () => (
  <>
    <filter id="svg-filter-test">
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
      <feOffset dx="-1" dy="-1" result="a" />
      <feOffset dx="2" dy="2" in="a" result="b" />
      <feMerge> 
        <feMergeNode in="a" />
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="svg-filter-shadow">
      <feDropShadow dx="5" dy="0" stdDeviation="1"/>
      <feDropShadow dx="-5" dy="0" stdDeviation="1"/>
    </filter>
  </>
);

export default EnvDefs;