#!/bin/bash
npm i
API_KEY=$(cat wordnikApiKey)
export WORDNIK_API_KEY=$API_KEY
nohup npm start >> ./vocab.log 2>&1 &