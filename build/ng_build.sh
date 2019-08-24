echo "Removing dist dir build/dist..."
rm -rf dist
echo "Removed dist..."
ng build --base-href=/ReproTasMan --output-path build/dist/ReproTasMan
echo "Build complete!!! files in build/dist"
