#!/bin/bash
echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=sdm-ape-lab
