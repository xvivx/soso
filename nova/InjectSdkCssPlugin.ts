import type { OutputChunk, Plugin } from 'rollup';

export default function InjectSdkCssPlugin(): Plugin {
  return {
    name: 'inline-css-into-entry',
    generateBundle(_, bundles) {
      const css: string[] = [];
      let entry: OutputChunk | undefined = undefined;

      for (const asset in bundles) {
        const chunk = bundles[asset];

        if (chunk.type === 'asset' && asset.endsWith('.css')) {
          css.push(chunk.source as string);
          delete bundles[asset];
        } else if (chunk.type === 'chunk' && chunk.isEntry) {
          entry = entry || chunk;
        }
      }

      if (entry && css.length) {
        const styles = `(()=>{const css=${JSON.stringify(css.join('\n'))};const style=document.createElement('style');style.innerHTML=css;document.head.appendChild(style);})();`;
        entry.code += styles;
      }
    },
  };
}
