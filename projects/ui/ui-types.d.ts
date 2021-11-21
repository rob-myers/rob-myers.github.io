declare namespace UiTypes {

  export type IconKey = (
    | 'eye'
    | 'down'
    | 'right'
    | 'run'
    | 'finish'
  );

  export interface DraggablePathApi {
    setPath: (path: Geom.Vect[]) => void;
  }

}
