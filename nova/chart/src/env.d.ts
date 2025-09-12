declare module 'chartiq' {
  declare module 'chartiq/js/componentUI' {
    declare namespace CIQ {
      const MINUTE: number;
      const SECOND: number;
    }
  }
}

declare module 'chartiq/key' {
  import { CIQ } from 'chartiq/js/componentUI';

  const getLicenseKey: (chart: CIQ) => void;
  export default getLicenseKey;
}

declare module '*.css' {}
