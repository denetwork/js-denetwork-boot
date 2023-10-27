FROM node:18.17.1

#   Define build-time parameter
#   docker build --build-arg PORT=8765 PEERS=http://localhost:9999,http://localhost:9998, -t my-node-app .
#ARG LISTEN_PORT=8011
#ARG LISTEN_ADDRESS=0.0.0.0
#ARG FILE_PEER_ID=/etc/denetwork/.peerId
#ARG FILE_SWARM_KEY=/etc/denetwork/.swarmKey
#ARG ANNOUNCE_MULTIADDRS
#
#ENV LISTEN_PORT=$LISTEN_PORT
#ENV LISTEN_ADDRESS=$LISTEN_ADDRESS
#ENV FILE_PEER_ID=$FILE_PEER_ID
#ENV FILE_SWARM_KEY=$FILE_SWARM_KEY
#ENV ANNOUNCE_MULTIADDRS=$ANNOUNCE_MULTIADDRS


#   create a working directory inside the container
WORKDIR /usr/src/app

#   copy the local package.json to the container
COPY package.json ./

#   install project dependencies
RUN npm install

#   copies all files in the current directory into the container (except those specified in .dockerignore)
COPY . .

#   expose the ports used by the application
EXPOSE 8011

#   run application inside container
#   docker run my-node-app arg1 arg2, arg1 and arg2 will pass to src/Relay.js
CMD [ "node", "src/main.js" ]
