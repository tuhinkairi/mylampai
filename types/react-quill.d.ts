declare module 'react-quill' {
    import { ComponentType } from 'react';
  
    interface ReactQuillProps {
      value: string;
      onChange: (value: string) => void;
      modules?: any;
      theme?: string;
      formats?: string[];
      placeholder?: string;
      className?: string;
    }
  
    const ReactQuill: ComponentType<ReactQuillProps>;
    export default ReactQuill;
  }
  
  declare module 'react-quill/dist/quill.snow.css';