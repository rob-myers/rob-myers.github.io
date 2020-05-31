import { useEffect, useRef } from 'react';

function createBlob(code: string) {
  return new Blob([code], { type: 'text/javascript' });
}

const EsModule: React.FC<Props> = ({
  code, 
  onMount = () => null,
  scriptId,
}) => {
  const blob = useRef(createBlob('// Empty module'));

  useEffect(() => {
    blob.current = createBlob(code);
    const url = URL.createObjectURL(blob.current);

    const el = document.createElement('script');
    el.id = scriptId;
    el.setAttribute('type', 'module');
    el.src = url;
    document.head.appendChild(el);
    onMount(url);

    return () => {
      URL.revokeObjectURL(url);
      document.getElementById(scriptId)?.remove();
    };
  }, [code]);

  return null;
};

interface Props {
  code: string;
  scriptId: string;
  onMount?: (scriptSrcUrl: string) => void;
}

export default EsModule;
