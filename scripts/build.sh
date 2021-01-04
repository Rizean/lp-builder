#!/usr/bin/env bash
rm -Rf dist
mkdir dist
cp -r node_modules/robot-js/lib/win32-x64-node-v72/robot.node dist/
cp -r ../vnsa-ui/build dist/ui
cp resources/settings.json dist/
cp resources/Nuance.PowerScribe360.application dist/Nuance.PowerScribe360.application
cp resources/Nuance.PowerScribe360.application dist/Nuance.PowerScribe360.application
cp resources/vnsa.ps1 dist/vnsa.ps1
mkdir dist/vpn
cp -r src/libs/controllers/vpn/scripts dist/vpn/scripts/
yarn install
./node_modules/.bin/pkg src/index.js --output ./dist/vnsa --targets node12-win-x64
#zip -r vnsa.zip dist
#sleep 30

#docker build -t $DOCKER_ID_USER/tcpinger .
#docker tag $DOCKER_ID_USER/tcpinger:latest
#docker push $DOCKER_ID_USER/tcpinger:latest
