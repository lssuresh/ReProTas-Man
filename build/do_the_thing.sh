echo "Stopping container..."
./stop.sh 
echo "Stopped container..."
echo "Starting build.."
./ng_build.sh $1 
echo "starting docker build" 
./docker_build.sh
echo "starting app repro...."
./start.sh
