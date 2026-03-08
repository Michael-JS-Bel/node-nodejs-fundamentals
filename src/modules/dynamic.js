import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dynamic = async () => {
  const name = process.argv[2];
  if (!name) {
    console.log('Plugin not found');
    process.exit(1);
  }
  const pluginPath = path.join(__dirname, 'plugins', `${name}.js`);
  try {
    const plugin = await import(pathToFileURL(pluginPath).href);
    if (typeof plugin.run !== 'function') {
      console.log('Plugin not found');
      process.exit(1);
    }
    const result = plugin.run();
    console.log(result);
  } catch {
    console.log('Plugin not found');
    process.exit(1);
  }
};

await dynamic();
