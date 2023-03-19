#!/bin/bash
# syntax=docker/dockerfile:1

FROM --platform=linux/amd64 python:3.9.15-buster
WORKDIR /usr/src/app
COPY package*.json ./
RUN apt update
RUN apt install -y npm
RUN npm install --legacy-peer-deps
RUN npm build
COPY . .
EXPOSE 5000
ENV HOST=0.0.0.0
CMD ["npm", "start"]