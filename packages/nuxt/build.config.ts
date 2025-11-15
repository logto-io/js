import { mkdist } from 'mkdist';
import { type BuildContext, defineBuildConfig } from 'unbuild';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineBuildConfig({
  hooks: {
    async 'build:done'(_ctx: BuildContext) {
      // Generate proper .d.ts files for runtime utils
      console.log('Generating runtime type declarations...');

      try {
        // Use mkdist with declaration enabled for runtime files
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        await mkdist({
          srcDir: 'src/runtime',
          distDir: 'dist/runtime',
          declaration: true,
          addRelativeDeclarationExtensions: true,
        });

        console.log('Runtime type declarations generated successfully');
      } catch (error) {
        console.error('Failed to generate runtime type declarations:', error);
      }
    },
  },
});
