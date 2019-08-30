echo "Removing dist dir build/dist..."
if [ $1 = "" ]
then
  env="qa"
else
  env=$1
fi
rm -rf dist
echo "Removed dist..."
echo "Building reproman for .."$env
ng build --base-href=/ReproTasMan --output-path build/dist/ReproTasMan --configuration=$env
echo "Build complete!!! files in build/dist"
