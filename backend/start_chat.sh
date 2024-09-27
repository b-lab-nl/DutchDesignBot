#!/bin/bash
CONFIG_FILE="settings.yaml"
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --config_file) CONFIG_FILE="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

PORT=$(grep 'port' "$CONFIG_FILE" | awk '{print $2}')
uvicorn main:app --reload --port $PORT
