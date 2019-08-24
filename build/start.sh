docker container stop reprotas
docker container rm reprotas
docker run  --name reprotas -d -p 9999:80 stgapps.prcins.net:18078/plymouthrock/reprotasman:latest 
